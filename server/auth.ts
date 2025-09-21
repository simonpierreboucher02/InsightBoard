import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Secure recovery key generation using crypto
function generateRecoveryKey(): string {
  const bytes = randomBytes(20); // 20 bytes = 160 bits of entropy
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  // Format as exactly 5 groups of 4 characters
  return result.match(/.{4}/g)?.join('-') || result;
}

// Safe user response (exclude sensitive fields)
function createSafeUserResponse(user: SelectUser) {
  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt,
  };
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate input
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.errors });
      }

      const { username, password } = result.data;

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const recoveryKey = generateRecoveryKey();
      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
        recoveryKey,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        // Return safe user data and recovery key (one-time only)
        res.status(201).json({ 
          user: createSafeUserResponse(user),
          recoveryKey: recoveryKey // Show recovery key only once at registration
        });
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", async (req, res, next) => {
    try {
      // Validate input
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.errors });
      }

      passport.authenticate("local", (err: any, user: SelectUser) => {
        if (err) return next(err);
        if (!user) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        req.login(user, (err) => {
          if (err) return next(err);
          // Return safe user data only
          res.status(200).json(createSafeUserResponse(user));
        });
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Return safe user data only
    res.json(createSafeUserResponse(req.user!));
  });
}

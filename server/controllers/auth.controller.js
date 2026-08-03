import bcrypt from "bcrypt";
import User from "../models/user.js";
import { validateSignUpData } from "../utils/validation.js";

export const signup = async (req, res) => {
  try {
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res.json({ message: "User Added successfully!", data: savedUser });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
};

export const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = await user.getJWT();
    res.cookie("token", token, {
      httpOnly: true,        // ✅ security
      sameSite: "lax",       // ✅ REQUIRED for localhost
      secure: false,         // ✅ MUST be false on http
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
};

export const logout = async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logout Successful!!");
};

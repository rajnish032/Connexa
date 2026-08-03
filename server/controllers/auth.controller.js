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

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
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
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
};

export const logout = async (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("token", null, {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    expires: new Date(Date.now()),
  });
  res.send("Logout Successful!!");
};

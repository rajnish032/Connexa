import { validateEditProfileData } from "../utils/validation.js";

export const viewProfile = (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

export const editProfile = async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid edit request");
    }

    Object.keys(req.body).forEach((k) => (req.user[k] = req.body[k]));
    await req.user.save();

    res.json({ data: req.user });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

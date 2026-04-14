const userService = require("../services/user.service");

const getUserProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserProfile(req.params.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const avatarUrl = req.file ? req.file.path : null;
    const user = await userService.updateProfile(req.user.id, req.body, avatarUrl);
    res.json({ message: "Profile updated successfully.", user });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await userService.changePassword(req.user.id, currentPassword, newPassword);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getUserProfile, updateProfile, changePassword };

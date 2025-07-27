const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: '输入验证失败',
      details: errors.array()
    });
  }
  next();
};

const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码至少需要6个字符')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('密码必须包含至少一个大写字母、一个小写字母和一个数字'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('姓名长度必须在2-50个字符之间'),
  handleValidationErrors
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('请输入密码'),
  handleValidationErrors
];

const resetPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  handleValidationErrors
];

const newPasswordValidation = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码至少需要6个字符')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('密码必须包含至少一个大写字母、一个小写字母和一个数字'),
  handleValidationErrors
];

module.exports = {
  registerValidation,
  loginValidation,
  resetPasswordValidation,
  newPasswordValidation,
  handleValidationErrors
}; 
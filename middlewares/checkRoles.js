const checkRoles = (requiredRoles) => {
  return (req, res, next) => {
    const {roles} = req.user;

    const hasPermission = requiredRoles.every((role) => roles.includes(role))
    if (!hasPermission) return res.status(403).send({message: "Forbidden: Permission denied!"})
    next()
  }
}

module.exports = checkRoles;
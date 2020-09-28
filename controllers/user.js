exports.read = (req, res) => {
    req.profile.hashed_password = undefined
    req.profile.sat = undefined
    return res.json(req.profile)
}
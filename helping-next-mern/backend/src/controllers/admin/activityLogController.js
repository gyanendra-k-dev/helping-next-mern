const { ActivityLog } = require("../../models");
const { paginate } = require("../../utils/db");
const asyncHandler = require("../../utils/asyncHandler");

exports.index = asyncHandler(async (req, res) => {
  res.json(await paginate(req, ActivityLog, { populate: "user", perPage: 50 }));
});

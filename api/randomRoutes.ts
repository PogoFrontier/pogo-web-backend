import e from "express";
import { parseToRule } from "../actions/parseToRule";
import { getRandomTeam } from "../team/randomTeam";
import { RuleDescription } from "../types/rule";

const router = e.Router();

// @desc Get a random team for a format
// @route GET /api/andom/name
// @access Public (for now)
const availableNames = [
  "de",
  "fr",
  "en",
  "ja",
  "ko",
  "ru",
  "zh_hans",
  "zh_hant"
]

router.get('/:rule', async (req, res) => {
    const des: RuleDescription = req.params.rule
    try{
      const rule = parseToRule(des)
      if (typeof req.query.language === "string" && availableNames.includes(req.query.language)) {
        res.json(getRandomTeam(rule, req.query.language))
      } else {
        res.json(getRandomTeam(rule, "en"))
      }
    } catch(err) {
        console.error(err);
        res.status(500).json({message: "Could not find rule of name: " + req.params.rule});
    }
});

export default router;
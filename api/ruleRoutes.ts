import e from "express";
import { parseToRule } from "../actions/parseToRule";
import { RuleDescription } from "../types/rule";

const router = e.Router();

// @desc Get a rule object from a given rule name
// @route GET /api/rule/name
// @access Public (for now)
router.get('/:rule', async (req, res) => {
    const des: RuleDescription = req.params.rule
    try{
      const rule = parseToRule(des)
      res.json(rule)
    } catch(err) {
        console.error(err);
        res.status(500).json({message: "Could not find rule of name: " + req.params.rule});
    }
});

export default router;
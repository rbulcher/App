const { Router } = require("express");
const LogEntry = require("../modules/logEntry");
const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const entries = await LogEntry.find();
    res.json(entries);
  } catch (error) {
    next(error);
  }
});

router.get("/findLocation/:id", async (req, res, next) => {
  try {
    const entry = await LogEntry.findById(req.params.id);
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

router.get("/findMonday", async (req, res, next) => {
    try {
      const entry = await LogEntry.find({deliverDateAndType : { "$regex": "Mon", "$options": "i" } });
      
      res.json(entry);
    } catch (error) {
      next(error);
    }
  });


router.post("/", async (req, res, next) => {
  try {
    const logEntry = new LogEntry(req.body);
    const createdEntry = await logEntry.save();
    res.json(createdEntry);
  } catch (error) {
    if (error.name === "ValidationError") {
      res.status(422);
    }
    next(error);
  }
});

router.get("/updateRoute/:address", async (req, res) => {
  try {
    const entry = await LogEntry.find({address : req.params.address});
    
    entry[0].address = "506 WHITE OAK DR"

    res.json(entry);
  } catch (error) {
    next(error);
  }
})

module.exports = router;

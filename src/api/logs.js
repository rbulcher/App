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

router.get("/deleteAllRoutes", async (req, res, next) => {
  try {
    const entries = await LogEntry.find();
    entries.forEach(entry => {
      entry.remove();
    })
    res.json(entries);
  } catch (error) {
    next(error);
  }
});

router.get("/deleteOne/:id", async (req, res, next) => {
  try {
    const entry = await LogEntry.findById(req.params.id);
    entry.remove();
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
    const entry = await LogEntry.find({
      deliverDateAndType: { $regex: "Mon", $options: "i" },
    });

    res.json(entry);
  } catch (error) {
    next(error);
  }
});
router.get("/findTuesday", async (req, res, next) => {
  try {
    const entry = await LogEntry.find({
      deliverDateAndType: { $regex: "Tue", $options: "i" },
    });

    res.json(entry);
  } catch (error) {
    next(error);
  }
});
router.get("/findWednesday", async (req, res, next) => {
  try {
    const entry = await LogEntry.find({
      deliverDateAndType: { $regex: "Wed", $options: "i" },
    });

    res.json(entry);
  } catch (error) {
    next(error);
  }
});
router.get("/findThursday", async (req, res, next) => {
  try {
    const entry = await LogEntry.find({
      deliverDateAndType: { $regex: "Thur", $options: "i" },
    });

    res.json(entry);
  } catch (error) {
    next(error);
  }
});
router.get("/findFriday", async (req, res, next) => {
  try {
    const entry = await LogEntry.find({
      deliverDateAndType: { $regex: "Fri", $options: "i" },
    });

    res.json(entry);
  } catch (error) {
    next(error);
  }
});
router.get("/findSaturday", async (req, res, next) => {
  try {
    const entry = await LogEntry.find({
      deliverDateAndType: { $regex: "Sat", $options: "i" },
    });

    res.json(entry);
  } catch (error) {
    next(error);
  }
});
router.get("/findSunday", async (req, res, next) => {
  try {
    const entry = await LogEntry.find({
      deliverDateAndType: { $regex: "Sun", $options: "i" },
    });

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

router.post("/updateEntry/:id", async (req, res, next) => {
  try {
    LogEntry.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          address: req.body.address,
          deliverDateAndType: req.body.deliveryDateAndType,
          description: req.body.description,
        },
      },
      { new: true },
      (error) => {
        console.log(error);
      }
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;

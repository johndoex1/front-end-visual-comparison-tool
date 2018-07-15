const Test = require('../models/tests.model.js');
const capture = require('../utilities/capture');
const fs = require('fs');

// Adds a new test
exports.create = (req, res) => {
  if (!req.body.name || !req.body.dev || !req.body.live) {
    return res.status(400).send({
      message: "Missing critical fields. Fields live, dev and name are required."
    })
  }

  const test = new Test({
    name: req.body.name,
    description: req.body.description || "",
    current: req.body.live,
    dev: req.body.dev
  })

  test.save().then((data) => {
    res.send(data)
  }).catch((error) => {
    res.status(500).send({
      message: error.message || "Error has occured"
    })
  })

}

// Finds a single test
exports.findAll = (req, res) => {
  Test.find().then((tests) => {
    res.send(tests)
  }).catch((error) => {
    res.status(500).send({
      message: error.message || "Error has occured"
    })
  })
}

// Finds one id
exports.findOne = (req, res) => {
  Test.findById(req.params.testId).then((test) => {
    if (!test) {
      return res.status(404).send({
        message: `No matching test with the id ${req.params.testId} could be found...`
      })
    }

    res.send(test)
  }).catch((error) => {
    if(error.kind === 'ObjectId') {
      return res.status(404).send({
        message: `Test with the id ${req.params.ntestId} could be found`
      })
    }

    return res.status(500).send({
      message: `Error retreiving test with id ${req.params.testId}`
    })
  })
}

// Updates a test
exports.update = (req, res) => {
  if (!req.body.name || !req.body.dev || !req.body.live) {
    return res.status(400).send({
      message: "Missing critical fields. Fields live, dev and name are required."
    })
  }

  Test.findByIdAndUpdate(req.params.testId, {
    name: req.body.name,
    description: req.body.description | "",
    current: req.body.live,
    dev: req.body.dev
  }, {new: true}).then((test) => {
    if (!test) {
      return res.status(404).send({
        message: `Test not found with id ${req.params.testId}`
      })
    }

    res.send(test);
  }).catch((error) => {
    if(error.kind === 'ObjectId') {
      return res.status(404).send({
        message: `Test with the id ${req.params.ntestId} could be found`
      })
    }

    return res.status(500).send({
      message: `Error retreiving test with id ${req.params.testId}`
    })
  })
}

exports.delete = (req, res) => {
  Test.findByIdAndRemove(req.params.testId).then((test) => {
    if (!test) {
      return res.status(404).send({
        message: `Test not found with id ${req.params.testId}`
      })
    }

    /* Clean up the directories so we don't have additional files floating 
    around if the user deletes a test. */
    const liveImage = `./client/public/diff/live_${req.params.testId}.png`
    const devImage = `./client/public/diff/dev_${req.params.testId}.png`
    const diffImage = `./client/public/diff/diff_${req.params.testId}.png`

    fs.stat(liveImage, function(error, stat) {
      if(error == null) {
        fs.unlink(liveImage)
      }
    });

    fs.stat(devImage, function(error, stat) {
      if(error == null) {
        fs.unlink(devImage)
      }
    });

    fs.stat(diffImage, function(error, stat) {
      if(error == null) {
        fs.unlink(diffImage)
      }
    });

    res.send({
      message: `Test with id ${req.params.testId} has been deleted...`
    })
  }).catch((error) => {
    if (error.kind === 'ObjectId' || error.name === 'NotFound') {
      return res.status(404).send({
          message: `Test not found with id ${req.params.noteId}`
      });                
    }
    return res.status(500).send({
        message: `Could not delete test with id ${req.params.noteId}`
    });
  })
}

// Runs a puppeteer test on all available tests
exports.testAll = (req, res) => {
  Test.find().then((tests) => {
    capture(tests)
    res.send('Running all tests')
  }).catch((error) => {
    res.status(500).send({
      message: error.message || "Error has occured"
    })
  })
}

// Runs a puppeteer test on a single test id
exports.testOne = (req, res) => {
  const tests = []
  Test.findById(req.params.testId).then((test) => {
    if (!test) {
      return res.status(404).send({
        message: `No matching test with the id ${req.params.testId} could be found...`
      })
    }
    tests.push(test)
    capture(tests)
    res.send(test)
  }).catch((error) => {
    if(error.kind === 'ObjectId') {
      return res.status(404).send({
        message: `Test with the id ${req.params.testId} could be found`
      })
    }

    return res.status(500).send({
      message: `Error retreiving test with id ${req.params.testId}`
    })
  })
}
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const uniqid = require("uniqid");
const multer = require("multer");
const { writeFile, createReadStream } = require("fs-extra");

const { check, validationResult } = require("express-validator");
const { readDB, writeDB } = require("../../lib/utilities");
const upload = multer({});

const reviewFilePath = path.join(__dirname, "reviews.json");
const reviewAsString = fs.readFileSync(reviewFilePath).toString();
const reviewsArray = JSON.parse(reviewAsString);


const projectsFilePath = path.join(__dirname, "projects.json");
const fileAsString = fs.readFileSync(projectsFilePath).toString();
const projectsArray = JSON.parse(fileAsString);

const projectsPhotoFilePath = path.join(
  __dirname,
  "../../../public/img/projects"
);

const readFile = fileName => {
  const buffer = fs.readFileSync(path.join(__dirname, fileName));
  const fileContent = buffer.toString();
  return JSON.parse(fileContent);
};

//   Every project will have this information:
//   - Name
//   - Description
//   - Creation Date
//   - ID
//   - RepoURL -> Code Repo URL (es.: GitHub / BitBucket project URL)
//   - LiveURL -> URL of the "live" project
//   - StudentID

//1. Get All PROJECTS
router.get("/", (req, res) => {
  res.status(200).send(projectsArray);
});

//2. Get specific
router.get("/:id", (req, res, next) => {
  try {
    const projects = readFile("projects.json");
    const project = projects.filter(project => project.id === req.params.id);
    if (project.length > 0) {
      res.send(project);
    } else {
      const err = new Error();
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    next(error);
  }
});

//2. Get All REVIEWS for sepcific project
router.get("/:id/reviews", (req, res) => {
  try {
    const projects = readFile("projects.json");
    const project = projects.filter(project => project.id === req.params.id);
    if (project.length > 0) {
      res.send(project);
    } else {
      const err = new Error();
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    next(error);
  }
});

//adding a review for a specific id

router.post(
  "/:id/reviews",
  [
    check("name")
      .isLength({ min: 2 })
      .withMessage("Name must be longer than 2 letters")
      .exists()
      .withMessage("Insert a name please!"),
    check("text")
      .isLength({ min: 5 })
      .withMessage("Description must be longer than 5 characters")
      .exists()
      .withMessage("What did you think of the project?"),
    check("date")
      .isInt()
      .exists()
      .withMessage(
        "YYYYMMDD"
      ),
  ],
  (req, res, next) => {
    //read all of project & then check id, if exisit? then create a new review & read all exisitng reviews, push new review in to array and write it back

    try {
      const errors = validationResult(req);
      const projects = readFile("projects.json");
      const project = projects.filter(project => project.id === req.params.id);

      if (project.length > 0 && errors.isEmpty()) {
        const newReview = {
          ...req.body,

        }
        reviewsArray.push(newReview);
        fs.writeFileSync(reviewFilePath, JSON.stringify(reviewsArray));
        res.status(201).send(newReview);
          }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

//add a new project

router.post(
  "/",

  [
    check("name")
      .isLength({ min: 2 })
      .withMessage("Name must be longer than 2 letters")
      .exists()
      .withMessage("Insert a name please!"),
    check("description")
      .isLength({ min: 5 })
      .withMessage("Description must be longer than 100 characters")
      .exists()
      .withMessage("Insert a description please!"),

    check("repoURL").exists().isURL().withMessage("Link to your GitHUb repo"),
    check("liveURL")
      .exists()
      .isURL()
      .withMessage(
        "Is your site up & running? Let us check it out with a link"
      ),
    check("studentId")
      .exists()
      .withMessage(
        "Insert your student ID to keep all your projects together!"
      ),
  ],
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      const buffer = fs.readFileSync(
        path.join(__dirname, "../students/students.json")
      );
      const students = JSON.parse(buffer.toString());
      const exists = students.find(
        student => student.id === req.body.studentId
      );
      if (errors.isEmpty()) {
        if (exists) {
          students.forEach(student => {
            if (student.id === exists.id) {
              console.log(student.id);
              exists.numberOfProjects = exists.numberOfProjects
                ? exists.numberOfProjects + 1
                : 1;
            }
          });
          fs.writeFileSync(
            path.join(__dirname, "../students/students.json"),
            JSON.stringify(students)
          );
          const newProject = {
            ...req.body,
            createdAt: new Date(),
            projectId: uniqid(),
          };
          projectsArray.push(newProject);
          fs.writeFileSync(projectsFilePath, JSON.stringify(projectsArray));
          res.status(201).send(newProject);
        } else {
          const newProject = {
            ...req.body,
            createdAt: new Date(),
            projectId: uniqid(),
          };
          projectsArray.push(newProject);
          fs.writeFileSync(projectsFilePath, JSON.stringify(projectsArray));
          res.status(201).send(newProject);
        }
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

router.delete("/:id", (req, res, next) => {
  try {
    const projects = readFile("projects.json");
    const filteredProjects = projects.filter(
      project => project.id !== req.params.id
    );
    fs.writeFileSync(projectsFilePath, JSON.stringify(filteredProjects));

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.put("/:id", (req, res, next) => {
  try {
    const projects = readFile("users.json");
    const filteredProjects = projects.filter(
      project => project.id !== req.params.id
    );

    const modifiedProject = {
      ...req.body,
      id: req.params.id,
      modifiedAt: new Date(),
    };
    if (modifiedProject.id === req.params.id) {
      filteredProjects.push(modifiedProject);
      fs.writeFileSync(projectsFilePath, JSON.stringify(filteredProjects));
      res.send(projectsArray);
    } else {
      res.status(400).send({ error: "No project found" });
    }
  } catch (error) {
    next(error);
  }
});

router.post(
  "/uploadPhoto/:projectID",
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      console.log(req.file);
      await writeFile(
        path.join(projectsPhotoFilePath, `${req.params.projectID}.jpg`),
        req.file.buffer
      );
      res.send("ok");
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

module.exports = router;

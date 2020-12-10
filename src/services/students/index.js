
//bring all of your reusable consts out & up for cleanliness
const express = require("express");
const router = express.Router();
const fs = require("fs"); //core module, file services
const path = require("path"); 
const uniqid = require("uniqid");
const multer = require("multer")
const { writeFile, createReadStream } = require("fs-extra")


const studentsFilePath = path.join(__dirname, "students.json");
const fileAsString = fs.readFileSync(studentsFilePath).toString();
const studentsArray = JSON.parse(fileAsString);
const { readDB, writeDB } = require("../../lib/utilities")
const upload = multer({})
const studentsPhotoFilePath = path.join(__dirname, "../../../public/img/students")



//1.
router.get("/", (req, res) => {
  res.status(200).send(studentsArray);
});

//2.
router.get("/:id", (req, res) => {
  const student = studentsArray.filter(
    student => student.ID === req.params.id
  );

  res.status(200).send(student);
});

//3.
router.post("/", (req, res) => {
  const newStudent = {
   ...req.body,
    id: uniqid(),
    
  };

studentsArray.push(newStudent);
fs.writeFileSync(studentsFilePath, JSON.stringify(studentsArray));
res.status(201).send(newStudent);
});


//4.  modify a single user
router.put("/:id", (req, res) => {

  const newStudentsArray = studentsArray.filter(
    student => student.id !== req.params.id
  );

  const modifiedStudent = req.body;
  if (modifiedStudent.id === req.params.id){
    newStudentsArray.push(modifiedStudent);
    fs.writeFileSync(usersFilePath, JSON.stringify(usersArray));
    res.send(usersArray);
  } else {
    res.status(400).send({ error: "No student found" });
  }
});

//5.  delete a single user
router.delete("/:id", (req, res) => {
  const newStudentsArray = studentsArray.filter(
    student => student.id !== req.params.id
  );

  fs.writeFileSync(studentsFilePath, JSON.stringify(newStudentsArray));

  res.status(200).send(newStudentsArray);
});



router.post("/uploadPhoto/:id", upload.single("avatar"), async (req, res, next) => {
  try {
    console.log(req.file);
    await writeFile(
      path.join(studentsPhotoFilePath, `${req.params.id}.jpg`),
      req.file.buffer
    )
    res.send("ok")
  } catch (error) {
    console.log(error)
    next(error)
  }
})

module.exports = router;

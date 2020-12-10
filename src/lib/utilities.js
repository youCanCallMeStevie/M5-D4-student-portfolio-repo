const { writeJSON, readJSON } = require("fs-extra")

const readDB = async filePath => {
  try {
    console.log(filePath);
    const fileJSON = await readJSON(filePath)
    return fileJSON
  } catch (error) {
   console.log(error)
  }
}

const writeDB = async (filePath, data) => {
  //writing on disk
  try {
    await writeJSON(filePath, data)
  } catch (error) {
   console.log(error)
  }
}

module.exports = {
  readDB,
  writeDB,
}

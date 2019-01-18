/**
 * @author zrthxn
 * Content Delivery Library
 */
const fs = require('fs');

exports.Lookup = (fileRef) => {
    var fileId = parseInt(fileRef, 36)
    /**
     * @author zrthxn
     * This function does the searching part and it has to be made fast
     * See the cdn folder for a clearer view of this
     * The file called cdnJookup.js is the lookup table
     * Inside that you'll see "$schema" and that sorta describes how data will eventually be stored
     */
    return new Promise((resolve,reject)=>{
        fs.readFile('./cdn/cdnLookup.json', (err, lookup) => {
            if(err) reject('LOOKUP_ERROR',err)

            let files = JSON.parse(lookup).files;
            let index = findFileById(files, fileId, 0, files.length-1)
            if(index !== -1)
                resolve(files[index])

            reject("FILE_NOT_FOUND"); 
        })
    });
}

exports.Upload = (file, filename, filepath, contentType, metadata) => {
    var genFileRef = generateFileRef()
    var genFileId = parseInt(genFileRef, 36)
    /**
     * @author zrthxn
     * The array called "files" in the lookup table file 
     * has to be sorted each time a new file is added
     */
    return new Promise((resolve,reject)=>{
        let lookup = JSON.parse(fs.readFileSync('./cdn/cdnLookup.json').toString())
        let files = lookup.files
        let insertIndex = 0;
        for(let i = 0; i < files.length; i++) {
            if (files[i].fileId < genFileId) continue
            else {
                insertIndex = i
                break
            }
        }
        files.push({})
        for (let j = files.length - 1; j > insertIndex; j++) {
            files[j] = files[j-1]
            files[j-1] = {}
        }
        files[insertIndex] = {
            "fileRef": genFileRef,
            "fileId": genFileId,
            "filename": filename,
            "contentType": contentType,
            "filepath": filepath,
            "metadata": metadata
        }
        lookup.files = files
        fs.writeFileSync('./cdn/cdnLookup.json', JSON.stringify(lookup, null, 4))

        fs.writeFileSync('./cdn/' + filepath + '/' + filename, file)

        resolve(genFileRef)
    });
}

// ============================================================= //

function findFileById(fArray, item, lo, hi){
    // Binary Search Algorithm
    if(hi >= lo) {
        var mid = Math.floor((lo + hi) / 2)
        if(item === fArray[mid].fileId)
            return mid
        else if (item > fArray[mid].fileId)
            return findFileById(fArray, item, mid + 1, hi)
        
        return findFileById(fArray, item, lo, mid - 1)
    }
    return -1
}

function findContentType() {
    // Extension MIME Type
    // .doc      application/msword
    // .dot      application/msword

    // .docx     application/vnd.openxmlformats-officedocument.wordprocessingml.document
    // .dotx     application/vnd.openxmlformats-officedocument.wordprocessingml.template
    // .docm     application/vnd.ms-word.document.macroEnabled.12
    // .dotm     application/vnd.ms-word.template.macroEnabled.12

    // .xls      application/vnd.ms-excel
    // .xlt      application/vnd.ms-excel
    // .xla      application/vnd.ms-excel

    // .xlsx     application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
    // .xltx     application/vnd.openxmlformats-officedocument.spreadsheetml.template
    // .xlsm     application/vnd.ms-excel.sheet.macroEnabled.12
    // .xltm     application/vnd.ms-excel.template.macroEnabled.12
    // .xlam     application/vnd.ms-excel.addin.macroEnabled.12
    // .xlsb     application/vnd.ms-excel.sheet.binary.macroEnabled.12

    // .ppt      application/vnd.ms-powerpoint
    // .pot      application/vnd.ms-powerpoint
    // .pps      application/vnd.ms-powerpoint
    // .ppa      application/vnd.ms-powerpoint

    // .pptx     application/vnd.openxmlformats-officedocument.presentationml.presentation
    // .potx     application/vnd.openxmlformats-officedocument.presentationml.template
    // .ppsx     application/vnd.openxmlformats-officedocument.presentationml.slideshow
    // .ppam     application/vnd.ms-powerpoint.addin.macroEnabled.12
    // .pptm     application/vnd.ms-powerpoint.presentation.macroEnabled.12
    // .potm     application/vnd.ms-powerpoint.template.macroEnabled.12
    // .ppsm     application/vnd.ms-powerpoint.slideshow.macroEnabled.12

    // .mdb      application/vnd.ms-access
}

function generateFileRef() {
    let fileRef = '', date = new Date()
    let lookupTable = JSON.parse(fs.readFileSync('./cdn/cdnLookup.json').toString())
    lookupTable.fileRefNumber++
    
    let day = date.getDate()>=10 ? (date.getDate()).toString() : '0' + (date.getDate()).toString() 
    let month = date.getMonth()>=9 ? (date.getMonth() + 1).toString() : '0' + (date.getMonth() + 1).toString()
    let dateDesgn = parseInt(day + month).toString(36).substring(1), l = 2 - dateDesgn.length
    for (let i=0; i<l; i++)
        dateDesgn = '0' + dateDesgn

    let flRef = (lookupTable.fileRefNumber).toString(36), k = 2 - flRef.length
    for (let i=0; i<k; i++)
        flRef = '0' + flRef

    fs.writeFileSync('./cdn/cdnLookup.json', JSON.stringify(lookupTable, null, 4))
    fileRef =  dateDesgn + flRef

    return fileRef
}
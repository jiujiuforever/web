//获取模板文件地址
import _Api from "@/api";
import waterfall from 'async-es/waterfall';
import Msg from './message'

function getFileInfo (code) {
    return new Promise((resolve, reject) => {
                let obj = {
                    code: code
                }
                _Api.getTemplateDetail(obj).then(res => {
                    let data = res.data
                    if (data.code == 1) {
                        if(data.rows){
                            resolve(data.rows)
                        } else{
                            reject('模板数据为空！')
                        }
                    } else {
                        reject(data.info)
                    }
                }).catch((err) => {
                    reject(err.data.message)
                })
    })
}
function downLoadFile (fileInfo) {
    let pramas = {
        viewPath:fileInfo.url,
        groupName:fileInfo.groupName
    }
    return new Promise((resolve, reject) => {
        _Api.templateDownload(pramas).then((response) => {
            let data = response.data
            resolve(data)
        })
        .catch(err => {
            reject(err.data.message)
        })
    })
}
function getBlobUrl (data,fileName) {
    let blob = new Blob([data], {
        type: 'application/octet-stream'
      })
    let filename = fileName || 'filename.txt'
    if (typeof window.navigator.msSaveBlob !== 'undefined') {
        //   ie10，ie11
        window.navigator.msSaveBlob(blob, filename)
    } else {
    //   NOIE
        let blobURL = window.URL.createObjectURL(blob)
        return blobURL
    }
}
export default {
    getFileStream (code) {
        return new Promise((resolve, reject) => {
            waterfall([
                function getTemplates (callback) {
                    let obj = {
                        code: code
                    }
                    _Api.getTemplateDetail(obj).then(res => {
                        let data = res.data
                        if (data.code == 1) {
                            if(data.rows){
                                callback(null, data.rows)
                            } else{
                                reject('模板数据为空！')
                            }
                        } else {
                            reject(data.info)
                        }
                    }).catch((err) => {
                        reject(err.data.message)
                    })
                },
                function downloadPrint (data, callback) {
                    let url = data.url.split('SRM')
                    let path = `SRM${url[1]}`
                    let pramas = {
                        groupName: data.groupName,
                        url: path
                    }
                    _Api.downLoadFile(pramas).then(function (response) {
                        let data = response.data;
                        // let jsonData = JSON.stringify(data, null, '\t')
                        resolve(data.rows[0].fileName)
                    }).catch((err) => {
                        reject(err.data.message)
                    })
                }
            ])
        })
    },
    getFileInfo (code) {
        return new Promise((resolve, reject) => {
                    let obj = {
                        code: code
                    }
                    _Api.getTemplateDetail(obj).then(res => {
                        let data = res.data
                        if (data.code == 1) {
                            if(data.rows){
                                resolve(data.rows)
                            } else{
                                reject('模板数据为空！')
                            }
                        } else {
                            reject(data.info)
                        }
                    }).catch((err) => {
                        reject(err.data.message)
                    })
        })
    },
   downLoadFile (fileInfo) {
        let pramas = {
            viewPath:fileInfo.url,
            groupName:fileInfo.groupName
        }
        return new Promise((resolve, reject) => {
            _Api.templateDownload(pramas).then((response) => {
                let data = response.data
                resolve(data)
            })
            .catch(err => {
                reject(err.data.message)
            })
        })
    },
    getBlobUrl (data,fileName) {
        let blob = new Blob([data], {
            type: 'application/octet-stream'
          })
        let filename = fileName || 'filename.txt'
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
            //   ie10，ie11
            window.navigator.msSaveBlob(blob, filename)
        } else {
        //   NOIE
            let blobURL = window.URL.createObjectURL(blob)
            return blobURL
        }
    },
    async getPrintTempUrl (type) {
        try{
            let  fileInfo = await getFileInfo(type)
            let  stream = await downLoadFile(fileInfo)
            let  tempUrl = await getBlobUrl(stream)
            return tempUrl
        }
        catch(err){
            Msg.showErrorMsg(err)
        }
    }
    }
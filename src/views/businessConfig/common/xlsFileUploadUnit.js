import XLSX from "xlsx";
// 文件上传后，本地触发的数据加载完的回调函数， 单个Excel 的处理
export async function fileDataLoad(file) {
    let target = await fileChange(file);
    return fileDealWith(target.result);
}
// 封装filerReader 的方法使其成为同步的函数
function fileChange(file) {
    return new Promise(function(resolve, reject) {
        let reader = new FileReader();
        reader.onload = () => {
            resolve(reader);
        };
        reader.onerror = () => {
            reject({
                code: 1,
                msg: "读取出错"
            });
        };
        reader.readAsArrayBuffer(file);
    });
}

// 将读到的数据转换成可识别的json 格式
function fileDealWith(data) {
    // 数据预处理
    let binary = "";
    let bytes = new Uint8Array(data);
    let length = bytes.byteLength;
    for (let i = 0; i < length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    /* 读取 workbook */
    let wb = XLSX.read(binary, { type: "binary" });
    let resultData = [];
    for (let i = 0, wsNames = wb.SheetNames; i < wsNames.length; i++) {
        let onews = wsNames[i];
        var wsData = wb.Sheets[onews];
        let json = XLSX.utils.sheet_to_json(wsData);
        resultData.push({ sheefName: wsNames[i], sheefData: json });
    }
    return resultData;
}

export function downLoadTemplate(url, fileName) {
    let filename = fileName || "filename.txt";
    let tempLink = document.createElement("a");
    tempLink.style.display = "none";
    tempLink.href = url;
    tempLink.setAttribute("download", filename);
    tempLink.setAttribute("target", "_blank");
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
}

export function downLoadOnlieTemplate(blob, fileName) {
    let filename = fileName || "filename.txt";
    let tempLink = document.createElement("a");
    tempLink.style.display = "none";
    tempLink.href = URL.createObjectURL(blob);
    tempLink.setAttribute("download", filename);
    tempLink.setAttribute("target", "_blank");
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
}
import _Api from "@/api";
import { MessageBox } from "element-ui";

function downLoadFileFunc(pramas, fileName) {
  _Api
    .templateDownload(pramas)
    .then(response => {
      let data = response.data;
      downLoad(data, fileName);
    })
    .catch(err => {
      MessageBox.alert(err.data.message, {
        showClose: false,
        confirmButton: "确定",
        customClass: "alertFailure"
      });
    });
}
export function downLoad(data, fileName) {
  let blob = new Blob([data], {
    type: "application/octet-stream"
  });
  let filename = fileName || "filename.txt";
  if (typeof window.navigator.msSaveBlob !== "undefined") {
    //   ie10，ie11
    window.navigator.msSaveBlob(blob, filename);
  } else {
    //   NOIE
    let blobURL = window.URL.createObjectURL(blob);
    let tempLink = document.createElement("a");
    tempLink.style.display = "none";
    tempLink.href = blobURL;
    tempLink.setAttribute("download", filename);
    if (typeof tempLink.download === "undefined") {
      tempLink.setAttribute("target", "_blank");
    }
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    window.URL.revokeObjectURL(blobURL);
  }
}
export default downLoadFileFunc;

// 获取 DOM 元素
const uploadButton = document.getElementById("uploadButton");
const fileInput = document.getElementById("fileInput");
const fileTableBody = document.querySelector("#fileTable tbody");

// 初始化加载文件列表
fetchFiles();

// 上传文件
uploadButton.addEventListener("click", uploadFile);

// 获取文件列表
async function fetchFiles() {
  const response = await fetch("/api/http/files");
  const data = await response.json();
  fileTableBody.innerHTML = data.files.map(file => `
    <tr>
      <td>${file}</td>
      <td>
        <button class="download-btn" data-filename="${file}">下载</button>
        <button class="delete-btn" data-filename="${file}">删除</button>
      </td>
    </tr>
  `).join("");

  // 动态绑定下载和删除按钮事件
  document.querySelectorAll(".download-btn").forEach(btn => {
    btn.addEventListener("click", () => downloadFile(btn.dataset.filename));
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => deleteFile(btn.dataset.filename));
  });
}

// 上传文件
async function uploadFile() {
  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  const response = await fetch("/api/http/files", {
    method: "POST",
    body: formData,
  });
  const result = await response.json();
  if (result.success) {
    alert("上传成功！");
    fetchFiles();
  }
}

// 删除文件
async function deleteFile(filename) {
  if (!confirm(`确定删除 ${filename} 吗？`)) return;
  const response = await fetch(`/api/http/files/${filename}`, { method: "DELETE" });
  const result = await response.json();
  if (result.success) {
    alert("删除成功！");
    fetchFiles();
  }
}

// 下载文件
function downloadFile(filename) {
  window.open(`/temps/${filename}`);
}
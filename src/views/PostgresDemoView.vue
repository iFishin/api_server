<template>
  <div class="postgres-demo">
    <h1>📊 PostgreSQL API 示例</h1>
    
    <div class="section">
      <h2>初始化数据库</h2>
      <button @click="initDatabase" class="btn btn-primary">初始化数据库表</button>
      <pre v-if="initResult">{{ initResult }}</pre>
    </div>

    <div class="section">
      <h2>创建用户</h2>
      <div class="form-group">
        <input v-model="newUser.name" placeholder="姓名" />
        <input v-model="newUser.email" placeholder="邮箱" />
        <input v-model.number="newUser.age" type="number" placeholder="年龄" />
        <button @click="createUser" class="btn btn-success">创建用户</button>
      </div>
      <pre v-if="createResult">{{ createResult }}</pre>
    </div>

    <div class="section">
      <h2>用户列表</h2>
      <button @click="fetchUsers" class="btn btn-info">刷新列表</button>
      <div v-if="users.length" class="users-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>姓名</th>
              <th>邮箱</th>
              <th>年龄</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>
                <input v-if="editingId === user.id" v-model="editForm.name" />
                <span v-else>{{ user.name }}</span>
              </td>
              <td>
                <input v-if="editingId === user.id" v-model="editForm.email" />
                <span v-else>{{ user.email }}</span>
              </td>
              <td>
                <input v-if="editingId === user.id" v-model.number="editForm.age" type="number" />
                <span v-else>{{ user.age }}</span>
              </td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>
                <template v-if="editingId === user.id">
                  <button @click="saveUser(user.id)" class="btn btn-sm btn-success">保存</button>
                  <button @click="cancelEdit" class="btn btn-sm btn-secondary">取消</button>
                </template>
                <template v-else>
                  <button @click="startEdit(user)" class="btn btn-sm btn-warning">编辑</button>
                  <button @click="deleteUser(user.id)" class="btn btn-sm btn-danger">删除</button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="no-data">暂无数据</p>
    </div>

    <div class="section">
      <h2>搜索用户</h2>
      <div class="form-group">
        <input v-model="searchEmail" placeholder="输入邮箱搜索" />
        <button @click="searchUsers" class="btn btn-info">搜索</button>
      </div>
      <pre v-if="searchResult">{{ searchResult }}</pre>
    </div>

    <div class="section">
      <h2>统计信息</h2>
      <button @click="fetchStatistics" class="btn btn-info">获取统计</button>
      <div v-if="statistics" class="statistics">
        <div class="stat-item">
          <span class="label">总用户数：</span>
          <span class="value">{{ statistics.total_users }}</span>
        </div>
        <div class="stat-item">
          <span class="label">平均年龄：</span>
          <span class="value">{{ parseFloat(statistics.average_age).toFixed(1) }}</span>
        </div>
        <div class="stat-item">
          <span class="label">首个用户：</span>
          <span class="value">{{ formatDate(statistics.first_user_date) }}</span>
        </div>
        <div class="stat-item">
          <span class="label">最新用户：</span>
          <span class="value">{{ formatDate(statistics.last_user_date) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

const API_BASE = '/api/postgres';

// 状态
const initResult = ref('');
const createResult = ref('');
const searchResult = ref('');
const users = ref<any[]>([]);
const statistics = ref<any>(null);
const editingId = ref<number | null>(null);

// 表单
const newUser = ref({
  name: '',
  email: '',
  age: undefined as number | undefined
});

const editForm = ref({
  name: '',
  email: '',
  age: undefined as number | undefined
});

const searchEmail = ref('');

// 初始化数据库
async function initDatabase() {
  try {
    const response = await axios.post(`${API_BASE}/init`);
    initResult.value = JSON.stringify(response.data, null, 2);
  } catch (error: any) {
    initResult.value = JSON.stringify(error.response?.data || error.message, null, 2);
  }
}

// 创建用户
async function createUser() {
  try {
    const response = await axios.post(`${API_BASE}/users`, newUser.value);
    createResult.value = JSON.stringify(response.data, null, 2);
    if (response.data.success) {
      // 清空表单
      newUser.value = { name: '', email: '', age: undefined };
      // 刷新列表
      fetchUsers();
    }
  } catch (error: any) {
    createResult.value = JSON.stringify(error.response?.data || error.message, null, 2);
  }
}

// 获取用户列表
async function fetchUsers() {
  try {
    const response = await axios.get(`${API_BASE}/users`);
    if (response.data.success) {
      users.value = response.data.data;
    }
  } catch (error) {
    console.error('获取用户列表失败', error);
  }
}

// 搜索用户
async function searchUsers() {
  try {
    const response = await axios.get(`${API_BASE}/users/search?email=${searchEmail.value}`);
    searchResult.value = JSON.stringify(response.data, null, 2);
  } catch (error: any) {
    searchResult.value = JSON.stringify(error.response?.data || error.message, null, 2);
  }
}

// 开始编辑
function startEdit(user: any) {
  editingId.value = user.id;
  editForm.value = {
    name: user.name,
    email: user.email,
    age: user.age
  };
}

// 取消编辑
function cancelEdit() {
  editingId.value = null;
  editForm.value = { name: '', email: '', age: undefined };
}

// 保存用户
async function saveUser(id: number) {
  try {
    const response = await axios.put(`${API_BASE}/users/${id}`, editForm.value);
    if (response.data.success) {
      cancelEdit();
      fetchUsers();
    }
  } catch (error) {
    console.error('更新用户失败', error);
  }
}

// 删除用户
async function deleteUser(id: number) {
  if (!confirm('确定要删除该用户吗？')) return;
  
  try {
    const response = await axios.delete(`${API_BASE}/users/${id}`);
    if (response.data.success) {
      fetchUsers();
    }
  } catch (error) {
    console.error('删除用户失败', error);
  }
}

// 获取统计信息
async function fetchStatistics() {
  try {
    const response = await axios.get(`${API_BASE}/statistics`);
    if (response.data.success) {
      statistics.value = response.data.data;
    }
  } catch (error) {
    console.error('获取统计信息失败', error);
  }
}

// 格式化日期
function formatDate(dateString: string) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('zh-CN');
}

// 页面加载时获取用户列表
fetchUsers();
</script>

<style scoped>
.postgres-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
}

h2 {
  color: #34495e;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

input {
  flex: 1;
  min-width: 150px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: #3498db;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-success {
  background-color: #2ecc71;
  color: white;
}

.btn-success:hover {
  background-color: #27ae60;
}

.btn-info {
  background-color: #1abc9c;
  color: white;
}

.btn-info:hover {
  background-color: #16a085;
}

.btn-warning {
  background-color: #f39c12;
  color: white;
}

.btn-warning:hover {
  background-color: #e67e22;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
}

pre {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 15px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;
}

.users-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #2c3e50;
}

tr:hover {
  background-color: #f8f9fa;
}

.no-data {
  text-align: center;
  color: #95a5a6;
  padding: 20px;
}

.statistics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.stat-item {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-item .label {
  font-weight: bold;
  color: #34495e;
}

.stat-item .value {
  color: #3498db;
  font-size: 18px;
  font-weight: bold;
}
</style>

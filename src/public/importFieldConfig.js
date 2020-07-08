/*
 *页面导入字段配置(主键)
 */

export const fieldConfigForEN = {
  // 积分项管理
  scoreItemManager: [
    { 编码: "quotaCode" },
    { 名称: "quotaName" },
    { 上级编码: "parentClassCode" },
    { 上级名称: "parentClassName" },
    { 顶级编码: "headClassCode" },
    { 顶级名称: "headClassName" },
    { 排序: "sort" },
    { 分值说明: "scoreDescription" }
  ],
  // 积分项分类管理
  classifyManager: [
    { 编码: "code" },
    { 名称: "name" },
    { 上级编码: "parentCode" },
    { 上级名称: "parentName" },
    { 排序: "sort" }
  ],
  // 基础数据导入需要，多个sheef, 配置规则：{ nameMap： 中英文对应映射， show:是否展示当前属性， edit :这列是否可以编辑,}
  baseTable: [
    {
      sheefName: "Sheet1",
      columnConfig: []
    }
  ]
};

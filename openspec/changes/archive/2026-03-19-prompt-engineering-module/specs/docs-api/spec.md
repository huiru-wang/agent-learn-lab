## ADDED Requirements

### Requirement: 获取文档列表 API
系统应当提供 API 返回 docs/ 目录下的文档列表。

#### Scenario: 获取列表
- **WHEN** GET /{module}/api/docs
- **THEN** 返回文档列表，按文件名排序，最多 10 个

#### Scenario: 返回格式
- **WHEN** 请求成功
- **THEN** 返回 { docs: [{ name: string, title: string }] }

### Requirement: 获取单个文档 API
系统应当提供 API 返回指定文档的内容。

#### Scenario: 获取文档
- **WHEN** GET /{module}/api/docs/{name}
- **THEN** 返回对应 Markdown 文件内容

#### Scenario: 文档不存在
- **WHEN** 请求的文档不存在
- **THEN** 返回 404 错误

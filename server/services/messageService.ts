import { pool } from '../config/postgres';
import { QueryResult } from 'pg';

/**
 * 留言数据接口
 */
export interface Message {
    id?: number;
    user_name: string;
    email?: string;
    content: string;
    parent_id?: number;  // 父留言ID（用于回复功能）
    ip_address?: string;
    user_agent?: string;
    status?: 'pending' | 'approved' | 'rejected' | 'deleted';  // 留言状态
    likes?: number;      // 点赞数
    is_pinned?: boolean; // 是否置顶
    created_at?: Date;
    updated_at?: Date;
}

/**
 * 留言板服务类
 */
export class MessageService {
    
    /**
     * 初始化留言板表
     */
    async initDatabase(): Promise<{ success: boolean; message: string }> {
        const createTableQuery = `
            -- 创建留言表
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                user_name VARCHAR(100) NOT NULL,
                email VARCHAR(255),
                content TEXT NOT NULL,
                parent_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
                ip_address VARCHAR(45),
                user_agent TEXT,
                status VARCHAR(20) DEFAULT 'approved',
                likes INTEGER DEFAULT 0,
                is_pinned BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            -- 创建索引
            CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
            CREATE INDEX IF NOT EXISTS idx_messages_parent_id ON messages(parent_id);
            CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_messages_pinned ON messages(is_pinned) WHERE is_pinned = TRUE;
            
            -- 创建更新时间触发器函数
            CREATE OR REPLACE FUNCTION update_messages_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
            
            -- 创建触发器
            DROP TRIGGER IF EXISTS update_messages_updated_at_trigger ON messages;
            CREATE TRIGGER update_messages_updated_at_trigger
                BEFORE UPDATE ON messages
                FOR EACH ROW
                EXECUTE FUNCTION update_messages_updated_at();
        `;
        
        try {
            await pool.query(createTableQuery);
            return {
                success: true,
                message: '留言板表初始化成功'
            };
        } catch (error) {
            return {
                success: false,
                message: `留言板表初始化失败: ${(error as Error).message}`
            };
        }
    }
    
    /**
     * 创建留言
     */
    async createMessage(message: Message): Promise<{ success: boolean; data?: Message; error?: string }> {
        const query = `
            INSERT INTO messages (user_name, email, content, parent_id, ip_address, user_agent, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        
        try {
            const result: QueryResult<Message> = await pool.query(query, [
                message.user_name,
                message.email || null,
                message.content,
                message.parent_id || null,
                message.ip_address || null,
                message.user_agent || null,
                message.status || 'approved'
            ]);
            
            return {
                success: true,
                data: result.rows[0]
            };
        } catch (error) {
            return {
                success: false,
                error: `创建留言失败: ${(error as Error).message}`
            };
        }
    }
    
    /**
     * 获取所有留言（支持分页、排序、筛选）
     */
    async getAllMessages(options: {
        limit?: number;
        offset?: number;
        status?: string;
        parentId?: number | null;
        sortBy?: 'created_at' | 'likes' | 'updated_at';
        sortOrder?: 'ASC' | 'DESC';
    } = {}): Promise<{ success: boolean; data?: Message[]; total?: number; error?: string }> {
        const {
            limit = 20,
            offset = 0,
            status = 'approved',
            parentId,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = options;
        
        try {
            // 构建 WHERE 条件
            const conditions: string[] = [];
            const params: any[] = [];
            let paramIndex = 1;
            
            if (status) {
                conditions.push(`status = $${paramIndex++}`);
                params.push(status);
            }
            
            // 处理 parent_id（null 表示顶级留言，number 表示回复）
            if (parentId === null) {
                conditions.push('parent_id IS NULL');
            } else if (parentId !== undefined) {
                conditions.push(`parent_id = $${paramIndex++}`);
                params.push(parentId);
            }
            
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            
            // 获取总数
            const countQuery = `SELECT COUNT(*) FROM messages ${whereClause}`;
            const countResult = await pool.query(countQuery, params);
            const total = parseInt(countResult.rows[0].count);
            
            // 获取分页数据（置顶的排在前面）
            params.push(limit, offset);
            const query = `
                SELECT * FROM messages
                ${whereClause}
                ORDER BY is_pinned DESC, ${sortBy} ${sortOrder}
                LIMIT $${paramIndex++} OFFSET $${paramIndex++}
            `;
            
            const result: QueryResult<Message> = await pool.query(query, params);
            
            return {
                success: true,
                data: result.rows,
                total
            };
        } catch (error) {
            return {
                success: false,
                error: `获取留言列表失败: ${(error as Error).message}`
            };
        }
    }
    
    /**
     * 获取留言树（包含回复）
     */
    async getMessageTree(limit: number = 20, offset: number = 0): Promise<{ success: boolean; data?: any[]; total?: number; error?: string }> {
        try {
            // 获取顶级留言总数
            const countQuery = `SELECT COUNT(*) FROM messages WHERE parent_id IS NULL AND status = 'approved'`;
            const countResult = await pool.query(countQuery);
            const total = parseInt(countResult.rows[0].count);
            
            // 获取顶级留言
            const topLevelQuery = `
                SELECT * FROM messages
                WHERE parent_id IS NULL AND status = 'approved'
                ORDER BY is_pinned DESC, created_at DESC
                LIMIT $1 OFFSET $2
            `;
            const topLevelResult = await pool.query(topLevelQuery, [limit, offset]);

            // 批量获取所有回复（替代原先的 N+1 次独立查询）
            const topLevelIds = topLevelResult.rows.map(m => m.id);
            const repliesMap = new Map<number, any[]>();
            if (topLevelIds.length > 0) {
                const repliesQuery = `
                    SELECT * FROM messages
                    WHERE parent_id = ANY($1::int[]) AND status = 'approved'
                    ORDER BY created_at ASC
                `;
                const repliesResult = await pool.query(repliesQuery, [topLevelIds]);
                // 按 parent_id 分组
                for (const reply of repliesResult.rows) {
                    const existing = repliesMap.get(reply.parent_id) || [];
                    existing.push(reply);
                    repliesMap.set(reply.parent_id, existing);
                }
            }

            // 组装留言树
            const messagesWithReplies = topLevelResult.rows.map(message => {
                const replies = repliesMap.get(message.id) || [];
                return {
                    ...message,
                    replies,
                    reply_count: replies.length
                };
            });
            
            return {
                success: true,
                data: messagesWithReplies,
                total
            };
        } catch (error) {
            return {
                success: false,
                error: `获取留言树失败: ${(error as Error).message}`
            };
        }
    }
    
    /**
     * 根据 ID 获取留言
     */
    async getMessageById(id: number): Promise<{ success: boolean; data?: Message; error?: string }> {
        const query = 'SELECT * FROM messages WHERE id = $1';
        
        try {
            const result: QueryResult<Message> = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: '留言不存在'
                };
            }
            
            return {
                success: true,
                data: result.rows[0]
            };
        } catch (error) {
            return {
                success: false,
                error: `获取留言失败: ${(error as Error).message}`
            };
        }
    }
    
    /**
     * 获取某条留言的所有回复
     */
    async getMessageReplies(parentId: number): Promise<{ success: boolean; data?: Message[]; error?: string }> {
        const query = `
            SELECT * FROM messages
            WHERE parent_id = $1 AND status = 'approved'
            ORDER BY created_at ASC
        `;
        
        try {
            const result: QueryResult<Message> = await pool.query(query, [parentId]);
            
            return {
                success: true,
                data: result.rows
            };
        } catch (error) {
            return {
                success: false,
                error: `获取回复失败: ${(error as Error).message}`
            };
        }
    }
    
    /**
     * 更新留言
     */
    async updateMessage(id: number, updates: Partial<Message>): Promise<{ success: boolean; data?: Message; error?: string }> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;
        
        // 允许更新的字段
        const allowedFields: (keyof Message)[] = ['user_name', 'email', 'content', 'status', 'is_pinned'];
        
        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                fields.push(`${field} = $${paramIndex++}`);
                values.push(updates[field]);
            }
        }
        
        if (fields.length === 0) {
            return {
                success: false,
                error: '没有需要更新的字段'
            };
        }
        
        values.push(id);
        const query = `
            UPDATE messages
            SET ${fields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;
        
        try {
            const result: QueryResult<Message> = await pool.query(query, values);
            
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: '留言不存在'
                };
            }
            
            return {
                success: true,
                data: result.rows[0]
            };
        } catch (error) {
            return {
                success: false,
                error: `更新留言失败: ${(error as Error).message}`
            };
        }
    }
    
    /**
     * 删除留言（软删除，修改状态）
     */
    async deleteMessage(id: number, hard: boolean = false): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            if (hard) {
                // 硬删除（真正从数据库删除）
                const query = 'DELETE FROM messages WHERE id = $1 RETURNING id';
                const result = await pool.query(query, [id]);
                
                if (result.rows.length === 0) {
                    return {
                        success: false,
                        error: '留言不存在'
                    };
                }
            } else {
                // 软删除（修改状态为 deleted）
                const query = `
                    UPDATE messages
                    SET status = 'deleted'
                    WHERE id = $1
                    RETURNING id
                `;
                const result = await pool.query(query, [id]);
                
                if (result.rows.length === 0) {
                    return {
                        success: false,
                        error: '留言不存在'
                    };
                }
            }
            
            return {
                success: true,
                message: '留言删除成功'
            };
        } catch (error) {
            return {
                success: false,
                error: `删除留言失败: ${(error as Error).message}`
            };
        }
    }
    
    /**
     * 点赞留言
     */
    async likeMessage(id: number): Promise<{ success: boolean; data?: { likes: number }; error?: string }> {
        const query = `
            UPDATE messages
            SET likes = likes + 1
            WHERE id = $1
            RETURNING likes
        `;
        
        try {
            const result = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: '留言不存在'
                };
            }
            
            return {
                success: true,
                data: { likes: result.rows[0].likes }
            };
        } catch (error) {
            return {
                success: false,
                error: `点赞失败: ${(error as Error).message}`
            };
        }
    }
    
    /**
     * 取消点赞
     */
    async unlikeMessage(id: number): Promise<{ success: boolean; data?: { likes: number }; error?: string }> {
        const query = `
            UPDATE messages
            SET likes = GREATEST(likes - 1, 0)
            WHERE id = $1
            RETURNING likes
        `;
        
        try {
            const result = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: '留言不存在'
                };
            }
            
            return {
                success: true,
                data: { likes: result.rows[0].likes }
            };
        } catch (error) {
            return {
                success: false,
                error: `取消点赞失败: ${(error as Error).message}`
            };
        }
    }
    
    /**
     * 置顶/取消置顶留言
     */
    async pinMessage(id: number, isPinned: boolean): Promise<{ success: boolean; message?: string; error?: string }> {
        const query = `
            UPDATE messages
            SET is_pinned = $1
            WHERE id = $2
            RETURNING id
        `;
        
        try {
            const result = await pool.query(query, [isPinned, id]);
            
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: '留言不存在'
                };
            }
            
            return {
                success: true,
                message: isPinned ? '留言已置顶' : '留言已取消置顶'
            };
        } catch (error) {
            return {
                success: false,
                error: `操作失败: ${(error as Error).message}`
            };
        }
    }
    
    /**
     * 审核留言（批准/拒绝）
     */
    async reviewMessage(id: number, status: 'approved' | 'rejected'): Promise<{ success: boolean; message?: string; error?: string }> {
        const query = `
            UPDATE messages
            SET status = $1
            WHERE id = $2
            RETURNING id
        `;
        
        try {
            const result = await pool.query(query, [status, id]);
            
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: '留言不存在'
                };
            }
            
            return {
                success: true,
                message: status === 'approved' ? '留言已批准' : '留言已拒绝'
            };
        } catch (error) {
            return {
                success: false,
                error: `审核失败: ${(error as Error).message}`
            };
        }
    }
    
    /**
     * 搜索留言
     */
    async searchMessages(keyword: string, limit: number = 20, offset: number = 0): Promise<{ success: boolean; data?: Message[]; total?: number; error?: string }> {
        try {
            // 获取总数
            const countQuery = `
                SELECT COUNT(*) FROM messages
                WHERE (user_name ILIKE $1 OR email ILIKE $1 OR content ILIKE $1)
                AND status = 'approved'
            `;
            const countResult = await pool.query(countQuery, [`%${keyword}%`]);
            const total = parseInt(countResult.rows[0].count);
            
            // 获取搜索结果
            const query = `
                SELECT * FROM messages
                WHERE (user_name ILIKE $1 OR email ILIKE $1 OR content ILIKE $1)
                AND status = 'approved'
                ORDER BY created_at DESC
                LIMIT $2 OFFSET $3
            `;
            const result: QueryResult<Message> = await pool.query(query, [`%${keyword}%`, limit, offset]);
            
            return {
                success: true,
                data: result.rows,
                total
            };
        } catch (error) {
            return {
                success: false,
                error: `搜索失败: ${(error as Error).message}`
            };
        }
    }
    
    /**
     * 获取统计信息
     */
    async getStatistics(): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_messages,
                    COUNT(*) FILTER (WHERE status = 'approved') as approved_messages,
                    COUNT(*) FILTER (WHERE status = 'pending') as pending_messages,
                    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_messages,
                    COUNT(*) FILTER (WHERE parent_id IS NULL) as top_level_messages,
                    COUNT(*) FILTER (WHERE parent_id IS NOT NULL) as reply_messages,
                    SUM(likes) as total_likes,
                    MIN(created_at) as first_message_date,
                    MAX(created_at) as last_message_date
                FROM messages
            `;
            
            const result = await pool.query(query);
            
            return {
                success: true,
                data: result.rows[0]
            };
        } catch (error) {
            return {
                success: false,
                error: `获取统计信息失败: ${(error as Error).message}`
            };
        }
    }
    
    /**
     * 批量删除留言
     */
    async batchDeleteMessages(ids: number[], hard: boolean = false): Promise<{ success: boolean; message?: string; error?: string }> {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            if (hard) {
                const query = 'DELETE FROM messages WHERE id = ANY($1)';
                await client.query(query, [ids]);
            } else {
                const query = `UPDATE messages SET status = 'deleted' WHERE id = ANY($1)`;
                await client.query(query, [ids]);
            }
            
            await client.query('COMMIT');
            
            return {
                success: true,
                message: `成功删除 ${ids.length} 条留言`
            };
        } catch (error) {
            await client.query('ROLLBACK');
            return {
                success: false,
                error: `批量删除失败: ${(error as Error).message}`
            };
        } finally {
            client.release();
        }
    }
    
    /**
     * 获取最热留言（按点赞数排序）
     */
    async getHotMessages(limit: number = 10): Promise<{ success: boolean; data?: Message[]; error?: string }> {
        const query = `
            SELECT * FROM messages
            WHERE status = 'approved' AND parent_id IS NULL
            ORDER BY likes DESC, created_at DESC
            LIMIT $1
        `;
        
        try {
            const result: QueryResult<Message> = await pool.query(query, [limit]);
            
            return {
                success: true,
                data: result.rows
            };
        } catch (error) {
            return {
                success: false,
                error: `获取热门留言失败: ${(error as Error).message}`
            };
        }
    }
}

export const messageService = new MessageService();

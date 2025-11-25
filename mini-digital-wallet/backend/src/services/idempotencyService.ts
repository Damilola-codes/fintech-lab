import {db} from "../database";
class IdempotencyService {
    async check(idempotencyKey: string) {
        const result = await db.query(
            'SELECT * FROM idempotency_keys WHERE idempotency_key = $1',
            [idempotencyKey]
        );
        return result.rows[0];
    }

    async start(idempotencyKey: string, requestPayload: any) {
        await db.query(
            'INSERT INTO idempotency_keys (idempotency_key, request_json, status, created_at) VALUES ($1, $2, $3, NOW())',
            [idempotencyKey, JSON.stringify(requestPayload), 'in_progress']
        );
    }
    
    async complete(idempotencyKey: string, responsePayload: any) {
        await db.query(
            'UPDATE idempotency_keys SET response_json = $1, status = $2, updated_at = NOW() WHERE idempotency_key = $3',
            [JSON.stringify(responsePayload), 'completed', idempotencyKey]
        );
    }
}

export default new IdempotencyService();    
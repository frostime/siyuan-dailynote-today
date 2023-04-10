import { clientApi } from 'siyuan';

export const logger = clientApi.createLogger('OpenDiaryToday');

export function info(...msg: any[]): void {
    logger.info(...msg);
}

export function error(...msg: any[]): void {
    logger.error(...msg);
}


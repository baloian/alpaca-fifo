import moment from 'moment-timezone';
import { AlpacaTradTy } from './types';
import { readFile, readdir } from 'fs/promises';


export async function getListOfFilenames(dirPath: string): Promise<string[]> {
  let fileNames: string[] = [];
  try {
    fileNames = await readdir(dirPath);
  } catch (err) {
    console.error('Error reading files names:', err);
  }
  return fileNames.sort();
}


export async function readJsonFile(filePath: string): Promise<any> {
  try {
    const fileData = await readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(fileData);
    return jsonData;
  } catch (error) {
    console.error(error);
  }
  return null;
}


export function parseOrders(fileData: any): Promise<any> {
  fileData.trade_activities.forEach((e: any) => {
    const mt = moment(`${e.trade_date} ${e.trade_time}`, 'YYYY-MM-DD HH:mm:ss.SSS');
    const nyTime = moment.tz(mt, 'America/New_York');
    e.trade_time_ms = Number(nyTime.format('x'));
    e.qty = Number(e.qty);
    e.price = Number(e.price);
    e.gross_amount = Number(e.gross_amount);
  });
  fileData.trade_activities = fileData.trade_activities.sort((a: any, b: any) => a.trade_time_ms - b.trade_time_ms);
  return fileData;
}


export function isValidDateString(value: string, format: string): boolean {
  const date = moment(value, format);
  return date.isValid();
}


// The format is as follow:
// ['Symbol', 'Quantity', 'Date Acquired', 'Date Sold', 'Acquired Cost', 'Sold Gross Amount', 'Gain or Loss']
export function getTradeRecord(buyTrade: AlpacaTradTy, sellTrade: AlpacaTradTy): string[] {
  return [
    buyTrade.symbol,
    `${buyTrade.qty}`,
    `${buyTrade.trade_date}T${buyTrade.trade_time}`,
    `${sellTrade.trade_date}T${sellTrade.trade_time}`,
    `${buyTrade.gross_amount}`,
    `${Math.abs(sellTrade.gross_amount)}`,
    `${((Math.abs(sellTrade.gross_amount) - Math.abs(buyTrade.gross_amount))).toFixed(2)}`
  ];
}

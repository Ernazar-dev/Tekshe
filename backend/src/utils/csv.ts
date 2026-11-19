/**
 * CSV kletkası: tırnaqlar ekranlanadı, «=,+,-,@» menen baslanatuǵın mánisler
 * Excel formulası sıpatında orınlanbawı ushın aldına apostrof qoyıladı (CSV injection).
 */
export const csvCell = (value: unknown): string => {
  const text = String(value ?? '').replace(/^[=+\-@\t\r]/, "'$&");
  return `"${text.replaceAll('"', '""')}"`;
};

/** UTF-8 BOM — Excel qaraqalpaq háriplerin durıs kórsetiwi ushın */
export const toCsv = (rows: unknown[][]): string => '﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n');

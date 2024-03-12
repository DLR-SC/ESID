// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

export const zoomReset = (offsetX = 0, offsetY = 0, scaling = 1) =>
   `
   M ${(15 * scaling + offsetX).toString()}   ${(3 * scaling + offsetY).toString()}
   l ${(2.3 * scaling).toString()}            ${(2.3 * scaling).toString()}
   l ${(-2.89 * scaling).toString()}	       ${(2.87 * scaling).toString()}
   l ${(1.42 * scaling).toString()}	          ${(1.42 * scaling).toString()}
   L ${(18.7 * scaling + offsetX).toString()} ${(6.7 * scaling + offsetY).toString()}
   L ${(21 * scaling + offsetX).toString()}	 ${(9 * scaling + offsetY).toString()}
   V ${(3 * scaling + offsetY).toString()}
   H ${(15 * scaling + offsetX).toString()}
   z
   
   M ${(3 * scaling + offsetX).toString()}	 ${(9 * scaling + offsetY).toString()}
   l ${(2.3 * scaling).toString()}	          ${(-2.3 * scaling).toString()}
   l ${(2.87 * scaling).toString()}	          ${(2.89 * scaling).toString()}
   l ${(1.42 * scaling).toString()}	          ${(-1.42 * scaling).toString()}
   L ${(6.7 * scaling + offsetX).toString()}	 ${(5.3 * scaling + offsetY).toString()}
   L ${(9 * scaling + offsetX).toString()}	 ${(3 * scaling + offsetY).toString()}
   H ${(3 * scaling + offsetX).toString()}
   V ${(9 * scaling + offsetY).toString()}
   z
   
   M ${(9 * scaling + offsetX).toString()}	 ${(21 * scaling + offsetY).toString()}
   l ${(-2.3 * scaling).toString()}	          ${(-2.3 * scaling).toString()}
   l ${(2.89 * scaling).toString()}	          ${(-2.87 * scaling).toString()}
   l ${(-1.42 * scaling).toString()}	       ${(-1.42 * scaling).toString()}
   L ${(5.3 * scaling + offsetX).toString()}	 ${(17.3 * scaling + offsetY).toString()}
   L ${(3 * scaling + offsetX).toString()}	 ${(15 * scaling + offsetY).toString()}
   v ${(6 * scaling).toString()}
   H ${(9 * scaling + offsetX).toString()}
   z
   
   M ${(21 * scaling + offsetX).toString()}   ${(15 * scaling + offsetY).toString()}
   l ${(-2.3 * scaling).toString()}	          ${(2.3 * scaling).toString()}
   l ${(-2.87 * scaling).toString()}	       ${(-2.89 * scaling).toString()}
   l ${(-1.42 * scaling).toString()}	       ${(1.42 * scaling).toString()}
   l ${(2.89 * scaling).toString()}	          ${(2.87 * scaling).toString()}
   L ${(15 * scaling + offsetX).toString()}   ${(21 * scaling + offsetY).toString()}
   h ${(6 * scaling).toString()}
   V ${(15 * scaling + offsetY).toString()}
   z
   `;

export const zoomOut = (offsetX = 0, offsetY = 0, scaling = 1) =>
   `
M ${(15.5 * scaling * offsetX).toString()} ${(14 * scaling + offsetY).toString()}
h ${(-.79 * scaling).toString()}
l ${(-.28 * scaling).toString()} ${(-.27 * scaling).toString()}
C  15.41 12.59, 16    11.11, 16    9.5, 16 5.91, 13.09 3, 9.5 3
S  3     5.91,  3     9.5,   5.91  16, 9.5 16
c  1.61  0,     3.09  -.59,  4.23  -1.57
l ${(.27 * scaling).toString()} ${(.28 * scaling).toString()}
v ${(.79 * scaling).toString()}
l ${(5 * scaling).toString()} ${(4.99 * scaling).toString()}
L ${(20.49 * scaling * offsetX).toString()} ${(19 * scaling + offsetY).toString()}
l ${(-4.99 * scaling).toString()} ${(-5 * scaling).toString()}
z

m ${(-6 * scaling).toString()} ${(0 * scaling).toString()}
C  7.01  14,    5     11.99, 5 9.5
S  7.01  5,     9.5   5,     14 7.01, 14 9.5, 11.99 14, 9.5 14
z

M ${(12 * scaling * offsetX).toString()} ${(10 * scaling + offsetY).toString()}
h ${(-2 * scaling).toString()}
v ${(2 * scaling).toString()}
H ${(9 * scaling + offsetX).toString()}
v ${(-2 * scaling).toString()}
H ${(7 * scaling + offsetX).toString()}
H ${(9 * scaling + offsetY).toString()}
h ${(2 * scaling).toString()}
H ${(7 * scaling + offsetY).toString()}
h ${(1 * scaling).toString()}
v ${(2 * scaling).toString()}
h ${(2 * scaling).toString()}
v ${(1 * scaling).toString()}
z
   `
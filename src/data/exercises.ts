import { DrawExercise, Balance1Exercise, StepExercise, Balance2Exercise, ManipulativeExercise, Tutorial } from '../types.ts';

export const getTutorials = (studentName: string = 'Rachel'): Tutorial[] => [
  {
    t: "Dibujar Ecuaciones",
    steps: [
      { txt: `Mira ${studentName}, si el cartel dice X, yo pongo un bloque morado.`, v: "🟪" },
      { txt: "Si dice +1, pongo un cuadrito amarillo.", v: "🟨" },
      { txt: "Si dice x², ponemos un bloque grande cuadrado.", v: "🟦" }
    ]
  },
  {
    t: "La Balanza",
    steps: [
      { txt: "Queremos dejar a la X solita en su plato.", v: "⚖️" },
      { txt: "Usa la operación contraria en los dos platos para mantener el equilibrio.", v: "🔄" }
    ]
  },
  {
    t: "Pasos Visuales",
    steps: [
      { txt: `¡Mira ${studentName}! En operaciones combinadas, resolvemos primero lo que está en cajas o paréntesis.`, v: "📦" },
      { txt: "En multiplicaciones agrupamos en cajas rojas. En divisiones repartimos en partes iguales.", v: "🔴" },
      { txt: "Después de resolver el paréntesis, sumamos o restamos lo que queda para llegar al resultado final.", v: "✨" }
    ]
  },
  {
    t: "Balanza Pro",
    steps: [
      { txt: "Paso 1: Primero quitamos los números sueltos usando la operación contraria.", v: "1️⃣" },
      { txt: "Paso 2: Al final dividimos o multiplicamos para dejar a la X completamente sola.", v: "2️⃣" }
    ]
  },
  {
    t: "Manipular Ecuaciones",
    steps: [
      { txt: `¡${studentName}, aquí manipularás los bloques con tus propias manos para poner a prueba tu cálculo!`, v: "✋" },
      { txt: "Arrastra figuras hacia afuera para restar, o hacia el centro para sumar.", v: "↔️" },
      { txt: "Haz clic sobre las figuras para multiplicarlas, o agrúpalas equitativamente para dividir.", v: "✨" }
    ]
  }
];

export const TUTORIALS: Tutorial[] = getTutorials('Rachel');

export const DRAW_EXERCISES: DrawExercise[] = [
  { x2: 0, x: 1, xd2: 0, xd3: 0, xd4: 0, u: 2, t: "x + 2" },
  { x2: 0, x: 0, xd2: 1, xd3: 0, xd4: 0, u: 1, t: "x/2 + 1" },
  { x2: 1, x: 1, xd2: 0, xd3: 0, xd4: 0, u: -2, t: "x² + x - 2" },
  { x2: 0, x: 2, xd2: 0, xd3: 1, xd4: 0, u: 0, t: "x/3 + 2x" },
  { x2: 1, x: 0, xd2: 0, xd3: 0, xd4: 0, u: 3, t: "x² + 3" },
  { x2: 0, x: 1, xd2: 0, xd3: 0, xd4: 1, u: -1, t: "x/4 + x - 1" },
  { x2: 2, x: -1, xd2: 0, xd3: 0, xd4: 0, u: 1, t: "2x² - x + 1" },
  { x2: 0, x: 1, xd2: 1, xd3: 0, xd4: 0, u: 2, t: "x/2 + x + 2" },
  { x2: 1, x: 2, xd2: 0, xd3: 0, xd4: 0, u: -3, t: "x² + 2x - 3" },
  { x2: 0, x: 3, xd2: 0, xd3: 0, xd4: 1, u: 1, t: "x/4 + 3x + 1" }
];

export const BALANCE1_EXERCISES: Balance1Exercise[] = [
  { x: 1, c: 4, r: 10 },
  { x: 1, c: -2, r: 5 },
  { x: 2, c: 0, r: 14 },
  { x: 1, c: 0, r: 3, isD: true },
  { x: 1, c: 5, r: 12 },
  { x: 1, c: 3, r: 8 },
  { x: 1, c: -4, r: 2 },
  { x: 3, c: 0, r: 12 },
  { x: 1, c: 0, r: 4, isD: true },
  { x: 1, c: 7, r: 15 }
];

// Complete 10 exercises for Tab 3 ("3. Pasos"), fixing the bug where there were only 2 items and it couldn't advance!
export const STEPS_EXERCISES: StepExercise[] = [
  {
    id: 1,
    title: "6 + (2 * 4)",
    pasos: [
      {
        v: "6 + <span class='highlight'>(2 * 4)</span>",
        p: "(2 * 4)",
        r: 8,
        bOutside: 6,
        mul: 2,
        mulCount: 4,
        order: 'outsideFirst'
      },
      {
        v: "6 + 8",
        p: "6 + 8",
        r: 14,
        bOutside: 6,
        bOp1: 8,
        order: 'outsideFirst'
      }
    ]
  },
  {
    id: 2,
    title: "(15 / 3) + 2",
    pasos: [
      {
        v: "<span class='highlight'>(15 / 3)</span> + 2",
        p: "(15 / 3)",
        r: 5,
        bOutside: 2,
        div: 3,
        divTotal: 15,
        order: 'opFirst'
      },
      {
        v: "5 + 2",
        p: "5 + 2",
        r: 7,
        bOutside: 2,
        bOp1: 5,
        order: 'opFirst'
      }
    ]
  },
  {
    id: 3,
    title: "4 + (3 * 3)",
    pasos: [
      {
        v: "4 + <span class='highlight'>(3 * 3)</span>",
        p: "(3 * 3)",
        r: 9,
        bOutside: 4,
        mul: 3,
        mulCount: 3,
        order: 'outsideFirst'
      },
      {
        v: "4 + 9",
        p: "4 + 9",
        r: 13,
        bOutside: 4,
        bOp1: 9,
        order: 'outsideFirst'
      }
    ]
  },
  {
    id: 4,
    title: "(12 / 4) + 8",
    pasos: [
      {
        v: "<span class='highlight'>(12 / 4)</span> + 8",
        p: "(12 / 4)",
        r: 3,
        bOutside: 8,
        div: 4,
        divTotal: 12,
        order: 'opFirst'
      },
      {
        v: "3 + 8",
        p: "3 + 8",
        r: 11,
        bOutside: 8,
        bOp1: 3,
        order: 'opFirst'
      }
    ]
  },
  {
    id: 5,
    title: "(5 * 2) + 7",
    pasos: [
      {
        v: "<span class='highlight'>(5 * 2)</span> + 7",
        p: "(5 * 2)",
        r: 10,
        bOutside: 7,
        mul: 5,
        mulCount: 2,
        order: 'opFirst'
      },
      {
        v: "10 + 7",
        p: "10 + 7",
        r: 17,
        bOutside: 7,
        bOp1: 10,
        order: 'opFirst'
      }
    ]
  },
  {
    id: 6,
    title: "9 + (16 / 4)",
    pasos: [
      {
        v: "9 + <span class='highlight'>(16 / 4)</span>",
        p: "(16 / 4)",
        r: 4,
        bOutside: 9,
        div: 4,
        divTotal: 16,
        order: 'outsideFirst'
      },
      {
        v: "9 + 4",
        p: "9 + 4",
        r: 13,
        bOutside: 9,
        bOp1: 4,
        order: 'outsideFirst'
      }
    ]
  },
  {
    id: 7,
    title: "(3 * 5) + 4",
    pasos: [
      {
        v: "<span class='highlight'>(3 * 5)</span> + 4",
        p: "(3 * 5)",
        r: 15,
        bOutside: 4,
        mul: 3,
        mulCount: 5,
        order: 'opFirst'
      },
      {
        v: "15 + 4",
        p: "15 + 4",
        r: 19,
        bOutside: 4,
        bOp1: 15,
        order: 'opFirst'
      }
    ]
  },
  {
    id: 8,
    title: "(18 / 2) + 3",
    pasos: [
      {
        v: "<span class='highlight'>(18 / 2)</span> + 3",
        p: "(18 / 2)",
        r: 9,
        bOutside: 3,
        div: 2,
        divTotal: 18,
        order: 'opFirst'
      },
      {
        v: "9 + 3",
        p: "9 + 3",
        r: 12,
        bOutside: 3,
        bOp1: 9,
        order: 'opFirst'
      }
    ]
  },
  {
    id: 9,
    title: "7 + (4 * 2)",
    pasos: [
      {
        v: "7 + <span class='highlight'>(4 * 2)</span>",
        p: "(4 * 2)",
        r: 8,
        bOutside: 7,
        mul: 4,
        mulCount: 2,
        order: 'outsideFirst'
      },
      {
        v: "7 + 8",
        p: "7 + 8",
        r: 15,
        bOutside: 7,
        bOp1: 8,
        order: 'outsideFirst'
      }
    ]
  },
  {
    id: 10,
    title: "(20 / 5) + 6",
    pasos: [
      {
        v: "<span class='highlight'>(20 / 5)</span> + 6",
        p: "(20 / 5)",
        r: 4,
        bOutside: 6,
        div: 5,
        divTotal: 20,
        order: 'opFirst'
      },
      {
        v: "4 + 6",
        p: "4 + 6",
        r: 10,
        bOutside: 6,
        bOp1: 4,
        order: 'opFirst'
      }
    ]
  }
];

export const BALANCE2_EXERCISES: Balance2Exercise[] = [
  { x: 2, c: 4, r: 10, ty: 'm' },
  { x: 1, c: 3, r: 8, ty: 'f', den: 2 },
  { x: 3, c: -3, r: 6, ty: 'm' },
  { x: 1, c: 1, r: 4, ty: 'f', den: 3 },
  { x: 2, c: 6, r: 16, ty: 'm' },
  { x: 1, c: -2, r: 3, ty: 'f', den: 2 },
  { x: 4, c: 4, r: 20, ty: 'm' },
  { x: 1, c: 5, r: 10, ty: 'f', den: 4 },
  { x: 3, c: 9, r: 12, ty: 'm' },
  { x: 5, c: 0, r: 25, ty: 'm' }
];

export const MANIPULATIVE_EXERCISES: ManipulativeExercise[] = [
  { id: 1, title: '2x + 4 = 10', xCount: 2, c: 4, r: 10, ty: 'm', sol: 3 },
  { id: 2, title: 'x/2 + 2 = 5', xCount: 1, c: 2, r: 5, ty: 'f', den: 2, sol: 6 },
  { id: 3, title: '3x - 3 = 6', xCount: 3, c: -3, r: 6, ty: 'm', sol: 3 },
  { id: 4, title: 'x/3 + 1 = 3', xCount: 1, c: 1, r: 3, ty: 'f', den: 3, sol: 6 },
  { id: 5, title: '2x + 6 = 12', xCount: 2, c: 6, r: 12, ty: 'm', sol: 3 },
  { id: 6, title: 'x/2 - 2 = 3', xCount: 1, c: -2, r: 3, ty: 'f', den: 2, sol: 10 },
  { id: 7, title: '3x + 3 = 12', xCount: 3, c: 3, r: 12, ty: 'm', sol: 3 },
  { id: 8, title: '4x + 4 = 16', xCount: 4, c: 4, r: 16, ty: 'm', sol: 3 },
  { id: 9, title: 'x/4 + 1 = 3', xCount: 1, c: 1, r: 3, ty: 'f', den: 4, sol: 8 },
  { id: 10, title: '2x + 8 = 16', xCount: 2, c: 8, r: 16, ty: 'm', sol: 4 }
];


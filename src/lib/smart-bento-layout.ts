import type {
  GalleryItemSize,
} from "@/lib/portfolio-media";

export type SmartBentoPlacement = {
  columnStart: number;
  rowStart: number;

  columnSpan: number;
  rowSpan: number;
};

type BentoDimensions = {
  width: number;
  height: number;
};

const SIZE_KEYS:
  GalleryItemSize[] = [
    "small",
    "wide",
    "tall",
    "large",
  ];

const SIZE_DIMENSIONS:
  Record<
    GalleryItemSize,
    BentoDimensions
  > = {
    small: {
      width: 1,
      height: 1,
    },

    wide: {
      width: 2,
      height: 1,
    },

    tall: {
      width: 1,
      height: 2,
    },

    large: {
      width: 2,
      height: 2,
    },
  };

type RemainingCounts =
  Record<
    GalleryItemSize,
    number
  >;

type ItemIndices =
  Record<
    GalleryItemSize,
    number[]
  >;

function createEmptyCounts():
  RemainingCounts {
  return {
    small: 0,
    wide: 0,
    tall: 0,
    large: 0,
  };
}

function createEmptyIndices():
  ItemIndices {
  return {
    small: [],
    wide: [],
    tall: [],
    large: [],
  };
}

function getDimensions(
  size:
    GalleryItemSize,

  columns:
    number,
): BentoDimensions {
  const base =
    SIZE_DIMENSIONS[
      size
    ];

  return {
    width:
      Math.min(
        base.width,
        columns,
      ),

    height:
      base.height,
  };
}

function getTotalArea(
  sizes:
    readonly GalleryItemSize[],

  columns:
    number,
) {
  return sizes.reduce(
    (
      total,
      size,
    ) => {
      const dimensions =
        getDimensions(
          size,
          columns,
        );

      return (
        total +
        dimensions.width *
          dimensions.height
      );
    },
    0,
  );
}

function findFirstEmptyCell(
  board:
    number[],

  columns:
    number,
) {
  const fullMask =
    (
      1 <<
      columns
    ) -
    1;

  for (
    let row = 0;
    row <
    board.length;
    row += 1
  ) {
    if (
      board[
        row
      ] ===
      fullMask
    ) {
      continue;
    }

    for (
      let column = 0;
      column <
      columns;
      column += 1
    ) {
      const bit =
        1 <<
        column;

      if (
        (
          board[
            row
          ] &
          bit
        ) ===
        0
      ) {
        return {
          row,
          column,
        };
      }
    }
  }

  return null;
}

function canPlace(
  board:
    number[],

  columns:
    number,

  row:
    number,

  column:
    number,

  dimensions:
    BentoDimensions,
) {
  if (
    column +
      dimensions.width >
      columns ||
    row +
      dimensions.height >
      board.length
  ) {
    return false;
  }

  const mask =
    (
      (
        1 <<
        dimensions.width
      ) -
      1
    ) <<
    column;

  for (
    let offset = 0;
    offset <
    dimensions.height;
    offset += 1
  ) {
    if (
      (
        board[
          row +
            offset
        ] &
        mask
      ) !==
      0
    ) {
      return false;
    }
  }

  return true;
}

function placeRectangle(
  board:
    number[],

  row:
    number,

  column:
    number,

  dimensions:
    BentoDimensions,
) {
  const mask =
    (
      (
        1 <<
        dimensions.width
      ) -
      1
    ) <<
    column;

  for (
    let offset = 0;
    offset <
    dimensions.height;
    offset += 1
  ) {
    board[
      row +
        offset
    ] |=
      mask;
  }
}

function removeRectangle(
  board:
    number[],

  row:
    number,

  column:
    number,

  dimensions:
    BentoDimensions,
) {
  const mask =
    (
      (
        1 <<
        dimensions.width
      ) -
      1
    ) <<
    column;

  for (
    let offset = 0;
    offset <
    dimensions.height;
    offset += 1
  ) {
    board[
      row +
        offset
    ] &=
      ~mask;
  }
}

function getRemainingTotal(
  remaining:
    RemainingCounts,
) {
  return (
    remaining.small +
    remaining.wide +
    remaining.tall +
    remaining.large
  );
}

function searchLayout(
  sizes:
    readonly GalleryItemSize[],

  columns:
    number,

  targetRows:
    number,
): SmartBentoPlacement[] | null {
  const board =
    new Array<number>(
      targetRows,
    ).fill(
      0,
    );

  const remaining =
    createEmptyCounts();

  const indices =
    createEmptyIndices();

  for (
    let index = 0;
    index <
    sizes.length;
    index += 1
  ) {
    const size =
      sizes[
        index
      ];

    remaining[
      size
    ] +=
      1;

    indices[
      size
    ].push(
      index,
    );
  }

  const placements:
    Array<
      SmartBentoPlacement | undefined
    > =
    new Array(
      sizes.length,
    );

  const totalArea =
    getTotalArea(
      sizes,
      columns,
    );

  const holeBudget =
    targetRows *
      columns -
    totalArea;

  if (
    holeBudget <
    0
  ) {
    return null;
  }

  const failedStates =
    new Set<string>();

  function getNextItemIndex(
    size:
      GalleryItemSize,
  ) {
    const used =
      indices[
        size
      ].length -
      remaining[
        size
      ];

    return (
      indices[
        size
      ][
        used
      ] ??
      Number.MAX_SAFE_INTEGER
    );
  }

  function buildStateKey(
    holesRemaining:
      number,
  ) {
    return [
      board.join(
        ",",
      ),

      remaining.small,
      remaining.wide,
      remaining.tall,
      remaining.large,

      holesRemaining,
    ].join(
      "|",
    );
  }

  function search(
    holesRemaining:
      number,
  ): boolean {
    if (
      getRemainingTotal(
        remaining,
      ) ===
      0
    ) {
      return true;
    }

    const stateKey =
      buildStateKey(
        holesRemaining,
      );

    if (
      failedStates.has(
        stateKey,
      )
    ) {
      return false;
    }

    const cell =
      findFirstEmptyCell(
        board,
        columns,
      );

    if (
      !cell
    ) {
      failedStates.add(
        stateKey,
      );

      return false;
    }

    /*
     * Kandidat dicoba berdasarkan
     * urutan asli dashboard.
     *
     * Artinya sistem tidak asal shuffle.
     * Reorder hanya terjadi kalau layout
     * sebelumnya memang tidak bisa
     * menghasilkan packing yang lebih
     * compact.
     */
    const candidates =
      SIZE_KEYS
        .filter(
          (
            size,
          ) => {
            if (
              remaining[
                size
              ] <=
              0
            ) {
              return false;
            }

            const dimensions =
              getDimensions(
                size,
                columns,
              );

            return canPlace(
              board,
              columns,
              cell.row,
              cell.column,
              dimensions,
            );
          },
        )
        .sort(
          (
            first,
            second,
          ) =>
            getNextItemIndex(
              first,
            ) -
            getNextItemIndex(
              second,
            ),
        );

    for (
      const size of
      candidates
    ) {
      const itemIndex =
        getNextItemIndex(
          size,
        );

      if (
        itemIndex ===
        Number.MAX_SAFE_INTEGER
      ) {
        continue;
      }

      const dimensions =
        getDimensions(
          size,
          columns,
        );

      placeRectangle(
        board,
        cell.row,
        cell.column,
        dimensions,
      );

      remaining[
        size
      ] -=
        1;

      placements[
        itemIndex
      ] = {
        columnStart:
          cell.column +
          1,

        rowStart:
          cell.row +
          1,

        columnSpan:
          dimensions.width,

        rowSpan:
          dimensions.height,
      };

      if (
        search(
          holesRemaining,
        )
      ) {
        return true;
      }

      placements[
        itemIndex
      ] =
        undefined;

      remaining[
        size
      ] +=
        1;

      removeRectangle(
        board,
        cell.row,
        cell.column,
        dimensions,
      );
    }

    /*
     * Kalau tidak ada kombinasi item
     * yang cocok, cell boleh menjadi
     * hole.
     *
     * Tapi hole baru dipakai setelah
     * semua kemungkinan tile dicoba.
     *
     * Karena itu sistem secara alami
     * memprioritaskan layout penuh.
     */
    if (
      holesRemaining >
      0
    ) {
      const bit =
        1 <<
        cell.column;

      board[
        cell.row
      ] |=
        bit;

      if (
        search(
          holesRemaining -
            1,
        )
      ) {
        return true;
      }

      board[
        cell.row
      ] &=
        ~bit;
    }

    failedStates.add(
      stateKey,
    );

    return false;
  }

  if (
    !search(
      holeBudget,
    )
  ) {
    return null;
  }

  return placements.map(
    (
      placement,
    ) =>
      placement ?? {
        columnStart: 1,
        rowStart: 1,
        columnSpan: 1,
        rowSpan: 1,
      },
  );
}

function createFallbackLayout(
  sizes:
    readonly GalleryItemSize[],

  columns:
    number,
): SmartBentoPlacement[] {
  let currentRow =
    1;

  return sizes.map(
    (
      size,
    ) => {
      const dimensions =
        getDimensions(
          size,
          columns,
        );

      const placement:
        SmartBentoPlacement = {
          columnStart:
            1,

          rowStart:
            currentRow,

          columnSpan:
            dimensions.width,

          rowSpan:
            dimensions.height,
        };

      currentRow +=
        dimensions.height;

      return placement;
    },
  );
}

export function getSmartBentoPlacements(
  sizes:
    readonly GalleryItemSize[],

  columns:
    number,
): SmartBentoPlacement[] {
  if (
    sizes.length ===
    0
  ) {
    return [];
  }

  if (
    columns <
    1 ||
    columns >
    4
  ) {
    return createFallbackLayout(
      sizes,
      Math.max(
        1,
        columns,
      ),
    );
  }

  const totalArea =
    getTotalArea(
      sizes,
      columns,
    );

  const minimumRows =
    Math.ceil(
      totalArea /
        columns,
    );

  /*
   * Worst-case:
   *
   * semua item ditumpuk vertikal.
   *
   * Jadi pencarian tetap punya batas
   * yang pasti dan tidak infinite.
   */
  const maximumRows =
    sizes.reduce(
      (
        total,
        size,
      ) =>
        total +
        getDimensions(
          size,
          columns,
        ).height,
      0,
    );

  /*
   * Cari layout dengan jumlah row
   * TERKECIL terlebih dahulu.
   *
   * Ini inti "smart" packing-nya.
   */
  for (
    let rows =
      minimumRows;

    rows <=
    maximumRows;

    rows +=
      1
  ) {
    const result =
      searchLayout(
        sizes,
        columns,
        rows,
      );

    if (
      result
    ) {
      return result;
    }
  }

  return createFallbackLayout(
    sizes,
    columns,
  );
}
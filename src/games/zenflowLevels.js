/**
 * Niveaux pour le jeu Flux Zen (Zen Flow).
 * 15 niveaux conçus et vérifiés à 100% pour la rééducation post-AVC :
 * - Franchissement de la ligne médiane (Crossing the Midline)
 * - Ancrage visuel gauche (Hémi-évi)
 * - 100% résolubles sans chevauchement
 */

export const ZEN_FLOW_LEVELS = [
  {
    "id": 1,
    "pack": "Source Douce",
    "size": 4,
    "pairs": [
      {
        "id": "cyan",
        "color": "#06b6d4",
        "label": "Cyan",
        "p1": [
          3,
          1
        ],
        "p2": [
          3,
          0
        ],
        "solutionLength": 2
      },
      {
        "id": "emerald",
        "color": "#10b981",
        "label": "\u00c9meraude",
        "p1": [
          0,
          0
        ],
        "p2": [
          1,
          2
        ],
        "solutionLength": 6
      },
      {
        "id": "amber",
        "color": "#f59e0b",
        "label": "Ambre",
        "p1": [
          0,
          1
        ],
        "p2": [
          2,
          2
        ],
        "solutionLength": 8
      }
    ]
  },
  {
    "id": 2,
    "pack": "Source Douce",
    "size": 4,
    "pairs": [
      {
        "id": "cyan",
        "color": "#06b6d4",
        "label": "Cyan",
        "p1": [
          2,
          1
        ],
        "p2": [
          3,
          3
        ],
        "solutionLength": 6
      },
      {
        "id": "emerald",
        "color": "#10b981",
        "label": "\u00c9meraude",
        "p1": [
          1,
          0
        ],
        "p2": [
          3,
          0
        ],
        "solutionLength": 3
      },
      {
        "id": "amber",
        "color": "#f59e0b",
        "label": "Ambre",
        "p1": [
          1,
          1
        ],
        "p2": [
          0,
          0
        ],
        "solutionLength": 7
      }
    ]
  },
  {
    "id": 3,
    "pack": "Source Douce",
    "size": 4,
    "pairs": [
      {
        "id": "cyan",
        "color": "#06b6d4",
        "label": "Cyan",
        "p1": [
          3,
          0
        ],
        "p2": [
          3,
          2
        ],
        "solutionLength": 3
      },
      {
        "id": "emerald",
        "color": "#10b981",
        "label": "\u00c9meraude",
        "p1": [
          1,
          3
        ],
        "p2": [
          3,
          3
        ],
        "solutionLength": 3
      },
      {
        "id": "amber",
        "color": "#f59e0b",
        "label": "Ambre",
        "p1": [
          0,
          3
        ],
        "p2": [
          1,
          1
        ],
        "solutionLength": 10
      }
    ]
  },
  {
    "id": 4,
    "pack": "Source Douce",
    "size": 4,
    "pairs": [
      {
        "id": "cyan",
        "color": "#06b6d4",
        "label": "Cyan",
        "p1": [
          1,
          2
        ],
        "p2": [
          1,
          3
        ],
        "solutionLength": 2
      },
      {
        "id": "emerald",
        "color": "#10b981",
        "label": "\u00c9meraude",
        "p1": [
          1,
          1
        ],
        "p2": [
          0,
          3
        ],
        "solutionLength": 4
      },
      {
        "id": "amber",
        "color": "#f59e0b",
        "label": "Ambre",
        "p1": [
          2,
          3
        ],
        "p2": [
          0,
          0
        ],
        "solutionLength": 10
      }
    ]
  },
  {
    "id": 5,
    "pack": "Source Douce",
    "size": 4,
    "pairs": [
      {
        "id": "cyan",
        "color": "#06b6d4",
        "label": "Cyan",
        "p1": [
          3,
          0
        ],
        "p2": [
          1,
          3
        ],
        "solutionLength": 10
      },
      {
        "id": "emerald",
        "color": "#10b981",
        "label": "\u00c9meraude",
        "p1": [
          3,
          3
        ],
        "p2": [
          3,
          1
        ],
        "solutionLength": 3
      },
      {
        "id": "amber",
        "color": "#f59e0b",
        "label": "Ambre",
        "p1": [
          2,
          3
        ],
        "p2": [
          1,
          2
        ],
        "solutionLength": 3
      }
    ]
  },
  {
    "id": 6,
    "pack": "Rivi\u00e8re Bleue",
    "size": 5,
    "pairs": [
      {
        "id": "cyan",
        "color": "#06b6d4",
        "label": "Cyan",
        "p1": [
          4,
          1
        ],
        "p2": [
          1,
          2
        ],
        "solutionLength": 9
      },
      {
        "id": "emerald",
        "color": "#10b981",
        "label": "\u00c9meraude",
        "p1": [
          1,
          1
        ],
        "p2": [
          0,
          4
        ],
        "solutionLength": 7
      },
      {
        "id": "amber",
        "color": "#f59e0b",
        "label": "Ambre",
        "p1": [
          3,
          3
        ],
        "p2": [
          3,
          2
        ],
        "solutionLength": 6
      },
      {
        "id": "rose",
        "color": "#f43f5e",
        "label": "Rose",
        "p1": [
          4,
          0
        ],
        "p2": [
          2,
          0
        ],
        "solutionLength": 3
      }
    ]
  },
  {
    "id": 7,
    "pack": "Rivi\u00e8re Bleue",
    "size": 5,
    "pairs": [
      {
        "id": "cyan",
        "color": "#06b6d4",
        "label": "Cyan",
        "p1": [
          0,
          2
        ],
        "p2": [
          0,
          4
        ],
        "solutionLength": 5
      },
      {
        "id": "emerald",
        "color": "#10b981",
        "label": "\u00c9meraude",
        "p1": [
          0,
          1
        ],
        "p2": [
          1,
          2
        ],
        "solutionLength": 3
      },
      {
        "id": "amber",
        "color": "#f59e0b",
        "label": "Ambre",
        "p1": [
          2,
          3
        ],
        "p2": [
          0,
          0
        ],
        "solutionLength": 8
      },
      {
        "id": "rose",
        "color": "#f43f5e",
        "label": "Rose",
        "p1": [
          2,
          4
        ],
        "p2": [
          4,
          0
        ],
        "solutionLength": 9
      }
    ]
  },
  {
    "id": 8,
    "pack": "Rivi\u00e8re Bleue",
    "size": 5,
    "pairs": [
      {
        "id": "cyan",
        "color": "#06b6d4",
        "label": "Cyan",
        "p1": [
          0,
          4
        ],
        "p2": [
          0,
          0
        ],
        "solutionLength": 7
      },
      {
        "id": "emerald",
        "color": "#10b981",
        "label": "\u00c9meraude",
        "p1": [
          2,
          0
        ],
        "p2": [
          4,
          4
        ],
        "solutionLength": 9
      },
      {
        "id": "amber",
        "color": "#f59e0b",
        "label": "Ambre",
        "p1": [
          1,
          0
        ],
        "p2": [
          1,
          2
        ],
        "solutionLength": 3
      },
      {
        "id": "rose",
        "color": "#f43f5e",
        "label": "Rose",
        "p1": [
          3,
          1
        ],
        "p2": [
          4,
          3
        ],
        "solutionLength": 6
      }
    ]
  },
  {
    "id": 9,
    "pack": "Rivi\u00e8re Bleue",
    "size": 5,
    "pairs": [
      {
        "id": "cyan",
        "color": "#06b6d4",
        "label": "Cyan",
        "p1": [
          0,
          0
        ],
        "p2": [
          0,
          4
        ],
        "solutionLength": 7
      },
      {
        "id": "emerald",
        "color": "#10b981",
        "label": "\u00c9meraude",
        "p1": [
          4,
          4
        ],
        "p2": [
          2,
          4
        ],
        "solutionLength": 5
      },
      {
        "id": "amber",
        "color": "#f59e0b",
        "label": "Ambre",
        "p1": [
          1,
          0
        ],
        "p2": [
          2,
          2
        ],
        "solutionLength": 4
      },
      {
        "id": "rose",
        "color": "#f43f5e",
        "label": "Rose",
        "p1": [
          4,
          3
        ],
        "p2": [
          4,
          1
        ],
        "solutionLength": 9
      }
    ]
  },
  {
    "id": 10,
    "pack": "Rivi\u00e8re Bleue",
    "size": 5,
    "pairs": [
      {
        "id": "cyan",
        "color": "#06b6d4",
        "label": "Cyan",
        "p1": [
          4,
          3
        ],
        "p2": [
          4,
          0
        ],
        "solutionLength": 4
      },
      {
        "id": "emerald",
        "color": "#10b981",
        "label": "\u00c9meraude",
        "p1": [
          1,
          4
        ],
        "p2": [
          4,
          4
        ],
        "solutionLength": 8
      },
      {
        "id": "amber",
        "color": "#f59e0b",
        "label": "Ambre",
        "p1": [
          0,
          4
        ],
        "p2": [
          0,
          0
        ],
        "solutionLength": 5
      },
      {
        "id": "rose",
        "color": "#f43f5e",
        "label": "Rose",
        "p1": [
          1,
          3
        ],
        "p2": [
          2,
          1
        ],
        "solutionLength": 8
      }
    ]
  },
  {
    "id": 11,
    "pack": "Oc\u00e9an d'\u00c9toiles",
    "size": 5,
    "pairs": [
      {
        "id": "cyan",
        "color": "#06b6d4",
        "label": "Cyan",
        "p1": [
          1,
          3
        ],
        "p2": [
          0,
          1
        ],
        "solutionLength": 4
      },
      {
        "id": "emerald",
        "color": "#10b981",
        "label": "\u00c9meraude",
        "p1": [
          4,
          2
        ],
        "p2": [
          4,
          0
        ],
        "solutionLength": 3
      },
      {
        "id": "amber",
        "color": "#f59e0b",
        "label": "Ambre",
        "p1": [
          2,
          3
        ],
        "p2": [
          4,
          4
        ],
        "solutionLength": 6
      },
      {
        "id": "rose",
        "color": "#f43f5e",
        "label": "Rose",
        "p1": [
          3,
          4
        ],
        "p2": [
          0,
          4
        ],
        "solutionLength": 4
      },
      {
        "id": "violet",
        "color": "#8b5cf6",
        "label": "Violet",
        "p1": [
          1,
          2
        ],
        "p2": [
          0,
          0
        ],
        "solutionLength": 8
      }
    ]
  },
  {
    "id": 12,
    "pack": "Oc\u00e9an d'\u00c9toiles",
    "size": 5,
    "pairs": [
      {
        "id": "cyan",
        "color": "#06b6d4",
        "label": "Cyan",
        "p1": [
          4,
          3
        ],
        "p2": [
          3,
          2
        ],
        "solutionLength": 3
      },
      {
        "id": "emerald",
        "color": "#10b981",
        "label": "\u00c9meraude",
        "p1": [
          1,
          3
        ],
        "p2": [
          0,
          0
        ],
        "solutionLength": 7
      },
      {
        "id": "amber",
        "color": "#f59e0b",
        "label": "Ambre",
        "p1": [
          4,
          2
        ],
        "p2": [
          4,
          0
        ],
        "solutionLength": 5
      },
      {
        "id": "rose",
        "color": "#f43f5e",
        "label": "Rose",
        "p1": [
          1,
          0
        ],
        "p2": [
          2,
          1
        ],
        "solutionLength": 3
      },
      {
        "id": "violet",
        "color": "#8b5cf6",
        "label": "Violet",
        "p1": [
          4,
          4
        ],
        "p2": [
          1,
          1
        ],
        "solutionLength": 7
      }
    ]
  },
  {
    "id": 13,
    "pack": "Oc\u00e9an d'\u00c9toiles",
    "size": 5,
    "pairs": [
      {
        "id": "cyan",
        "color": "#06b6d4",
        "label": "Cyan",
        "p1": [
          1,
          3
        ],
        "p2": [
          2,
          3
        ],
        "solutionLength": 8
      },
      {
        "id": "emerald",
        "color": "#10b981",
        "label": "\u00c9meraude",
        "p1": [
          0,
          0
        ],
        "p2": [
          0,
          4
        ],
        "solutionLength": 5
      },
      {
        "id": "amber",
        "color": "#f59e0b",
        "label": "Ambre",
        "p1": [
          4,
          2
        ],
        "p2": [
          3,
          1
        ],
        "solutionLength": 3
      },
      {
        "id": "rose",
        "color": "#f43f5e",
        "label": "Rose",
        "p1": [
          3,
          0
        ],
        "p2": [
          4,
          0
        ],
        "solutionLength": 2
      },
      {
        "id": "violet",
        "color": "#8b5cf6",
        "label": "Violet",
        "p1": [
          3,
          2
        ],
        "p2": [
          1,
          4
        ],
        "solutionLength": 7
      }
    ]
  },
  {
    "id": 14,
    "pack": "Oc\u00e9an d'\u00c9toiles",
    "size": 5,
    "pairs": [
      {
        "id": "cyan",
        "color": "#06b6d4",
        "label": "Cyan",
        "p1": [
          3,
          0
        ],
        "p2": [
          2,
          0
        ],
        "solutionLength": 2
      },
      {
        "id": "emerald",
        "color": "#10b981",
        "label": "\u00c9meraude",
        "p1": [
          3,
          1
        ],
        "p2": [
          1,
          2
        ],
        "solutionLength": 8
      },
      {
        "id": "amber",
        "color": "#f59e0b",
        "label": "Ambre",
        "p1": [
          0,
          0
        ],
        "p2": [
          2,
          4
        ],
        "solutionLength": 9
      },
      {
        "id": "rose",
        "color": "#f43f5e",
        "label": "Rose",
        "p1": [
          3,
          4
        ],
        "p2": [
          4,
          3
        ],
        "solutionLength": 3
      },
      {
        "id": "violet",
        "color": "#8b5cf6",
        "label": "Violet",
        "p1": [
          4,
          2
        ],
        "p2": [
          4,
          0
        ],
        "solutionLength": 3
      }
    ]
  },
  {
    "id": 15,
    "pack": "Oc\u00e9an d'\u00c9toiles",
    "size": 5,
    "pairs": [
      {
        "id": "cyan",
        "color": "#06b6d4",
        "label": "Cyan",
        "p1": [
          2,
          4
        ],
        "p2": [
          0,
          2
        ],
        "solutionLength": 5
      },
      {
        "id": "emerald",
        "color": "#10b981",
        "label": "\u00c9meraude",
        "p1": [
          3,
          0
        ],
        "p2": [
          3,
          2
        ],
        "solutionLength": 5
      },
      {
        "id": "amber",
        "color": "#f59e0b",
        "label": "Ambre",
        "p1": [
          1,
          2
        ],
        "p2": [
          2,
          0
        ],
        "solutionLength": 6
      },
      {
        "id": "rose",
        "color": "#f43f5e",
        "label": "Rose",
        "p1": [
          3,
          3
        ],
        "p2": [
          1,
          3
        ],
        "solutionLength": 3
      },
      {
        "id": "violet",
        "color": "#8b5cf6",
        "label": "Violet",
        "p1": [
          3,
          4
        ],
        "p2": [
          4,
          0
        ],
        "solutionLength": 6
      }
    ]
  }
];

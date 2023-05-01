(function () {
  // Set the initial player position
  let playerRow = parseInt(localStorage.getItem('playerRow') || '0');
  let playerCol = parseInt(localStorage.getItem('playerCol') || '0');
  let mazeCount = JSON.parse(localStorage.getItem('mazeCount') || '{}');
  let size = parseInt(localStorage.getItem('size') || '2')
  let maze = JSON.parse(localStorage.getItem('maze') || 'null') || generateMaze(size, size);

  document.getElementById('level').innerText = `Level ${size / 2}`
  document.title = `${document.title} - Level ${size / 2}`

  function generateMaze(widthLimit = 2, heightLimit = 2) {
    let startX = 0, startY = 0, haveBorder = false;

    const block = 1, unBlock = 0;
    const r = Math.random();

    if (startX < 0 || startX >= widthLimit)
      startX = Math.floor(Math.random() * widthLimit);
    if (startY < 0 || startY >= heightLimit)
      startY = Math.floor(Math.random() * heightLimit);

    if (!haveBorder) {
      widthLimit--;
      heightLimit--;
    }

    widthLimit *= 2;
    heightLimit *= 2;

    startX *= 2;
    startY *= 2;
    if (haveBorder) {
      startX++;
      startY++;
    }

    const mazeMap = new Array(widthLimit + 1).fill(0).map(() => new Array(heightLimit + 1).fill(block));

    const blockPos = [];
    let targetX = startX, targetY = startY;
    mazeMap[targetX][targetY] = unBlock;

    if (targetY > 1) {
      blockPos.push(targetX, targetY - 1, 0);
    }
    if (targetX < widthLimit) {
      blockPos.push(targetX + 1, targetY, 1);
    }
    if (targetY < heightLimit) {
      blockPos.push(targetX, targetY + 1, 2);
    }
    if (targetX > 1) {
      blockPos.push(targetX - 1, targetY, 3);
    }
    while (blockPos.length > 0) {
      const blockIndex = Math.floor(Math.random() * blockPos.length / 3) * 3;

      if (blockPos[blockIndex + 2] === 0) {
        targetX = blockPos[blockIndex];
        targetY = blockPos[blockIndex + 1] - 1;
      }
      else if (blockPos[blockIndex + 2] === 1) {
        targetX = blockPos[blockIndex] + 1;
        targetY = blockPos[blockIndex + 1];
      }
      else if (blockPos[blockIndex + 2] === 2) {
        targetX = blockPos[blockIndex];
        targetY = blockPos[blockIndex + 1] + 1;
      }
      else if (blockPos[blockIndex + 2] === 3) {
        targetX = blockPos[blockIndex] - 1;
        targetY = blockPos[blockIndex + 1];
      }

      if (mazeMap[targetX][targetY] === block) {
        mazeMap[blockPos[blockIndex]][blockPos[blockIndex + 1]] = unBlock;
        mazeMap[targetX][targetY] = unBlock;

        if (targetY > 1 && mazeMap[targetX][targetY - 1] === block && mazeMap[targetX][targetY - 2] === block) {
          blockPos.push(targetX, targetY - 1, 0);
        }
        if (targetX < widthLimit && mazeMap[targetX + 1][targetY] === block && mazeMap[targetX + 2] && mazeMap[targetX + 2][targetY] === block) {
          blockPos.push(targetX + 1, targetY, 1);
        }
        if (targetY < heightLimit && mazeMap[targetX][targetY + 1] === block && mazeMap[targetX][targetY + 2] === block) {
          blockPos.push(targetX, targetY + 1, 2);
        }
        if (targetX > 1 && mazeMap[targetX - 1][targetY] === block && mazeMap[targetX - 1][targetY] === block) {
          blockPos.push(targetX - 1, targetY, 3);
        }
      }
      blockPos.splice(blockIndex, 3);
    }

    localStorage.setItem('maze', JSON.stringify(mazeMap));
    return mazeMap;
  }

  // 画出 player 周围 9 个格子的迷宫
  function drawMaze(maze) {
    // Get the wrapper element
    const wrapper = document.querySelector('#wrapper');
    // Get the row and column of the current player cell
    const [currentPlayerRow, currentPlayerCol] = [playerRow, playerCol];
    // Calculate the range of rows and columns to draw
    const rowStart = currentPlayerRow - 1;
    const rowEnd = currentPlayerRow + 1;
    const colStart = currentPlayerCol - 1;
    const colEnd = currentPlayerCol + 1;
    // Create a new document fragment to hold the cells
    const fragment = document.createDocumentFragment();
    // Loop over the cells in the specified range
    for (let row = rowStart; row <= rowEnd; row++) {
      for (let col = colStart; col <= colEnd; col++) {
        // Create a new cell
        const cell = document.createElement('div');
        // Set the cell's id to the row and column
        cell.id = `cell-${row}-${col}`;
        // Add the cell class
        cell.classList.add('cell');
        // Add the wall class if the cell is a wall
        if (!maze[row] || maze[row][col] === undefined || maze[row][col] === 1) {
          cell.classList.add('wall');
        }
        // Add the current class if the cell is the player's current cell
        else if (row === currentPlayerRow && col === currentPlayerCol) {
          cell.classList.add('current');
        }
        // Add the begin class if the cell is the player's begin cell
        else if (row === 0 && col === 0) {
          cell.classList.add('begin');
        }
        // Add the goal class if the cell is the player's goal cell
        else if (row === maze.length - 1 && col === maze[0].length - 1) {
          cell.classList.add('goal');
        }
        else cell.style.backgroundColor = `rgba(0,0,255,${Math.min(1, (mazeCount[`${row}-${col}`] || 0) / 20)})`;

        cell.onclick = function () {
          if (row === playerRow && col === playerCol) {
            return;
          }
          if (row == playerRow - 1 && col == playerCol) {
            movePlayer('up');
          }
          else if (row == playerRow && col == playerCol - 1) {
            movePlayer('left');
          }
          else if (row == playerRow && col == playerCol + 1) {
            movePlayer('right');
          }
          else if (row == playerRow + 1 && col == playerCol) {
            movePlayer('down');
          }
          else {
            return;
          }
        };

        // Add the cell to the fragment
        fragment.appendChild(cell);
      }
    }

    // Clear the wrapper
    wrapper.innerHTML = '';
    // Add the fragment to the wrapper
    wrapper.appendChild(fragment);

    // 根据当前位置(currentPlayerRow,currentPlayerCol)相对于目标方块goal的位置(maze.length - 1, maze[0].length - 1)，
    // 计算出目标方块goal在哪个方向，然后给当前位置的周围的8个方格中的一个添加表示目标方块所在位置方向的类 goal-direction
    // 2: 下，3: 左，6：右下
    if (currentPlayerRow < maze.length - 1 && currentPlayerCol === maze[0].length - 1) {
      document.getElementById(`cell-${currentPlayerRow + 1}-${currentPlayerCol}`).classList.add('goal-direction', 'goal-direction-2');
    }
    else if (currentPlayerRow === maze.length - 1 && currentPlayerCol < maze[0].length - 1) {
      document.getElementById(`cell-${currentPlayerRow}-${currentPlayerCol + 1}`).classList.add('goal-direction', 'goal-direction-3');
    }
    else if (currentPlayerRow < maze.length - 1 && currentPlayerCol < maze[0].length - 1) {
      document.getElementById(`cell-${currentPlayerRow + 1}-${currentPlayerCol + 1}`).classList.add('goal-direction', 'goal-direction-6');
    }
  }

  // Function to check if the player has won
  function checkWin() {
    // Get the current player cell
    const currentPlayerCell = document.querySelector('.current');
    // Get the row and column of the current player cell
    const [currentPlayerRow, currentPlayerCol] = currentPlayerCell.id.split('-').slice(1);
    // Check if the player is in the goal cell
    if (parseInt(currentPlayerRow) === maze.length - 1 && parseInt(currentPlayerCol) === maze[0].length - 1) {
      return true;
    } else {
      return false;
    }
  }

  // Draw the maze
  drawMaze(maze);

  // Add event listener for arrow key presses
  document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'ArrowUp':
        movePlayer('up');
        break;
      case 'ArrowDown':
        movePlayer('down');
        break;
      case 'ArrowLeft':
        movePlayer('left');
        break;
      case 'ArrowRight':
        movePlayer('right');
        break;
    }
  });

  // Move the player and check for win on each move
  function movePlayer(direction) {
    // Remove the player's current position
    const currentPlayerCell = document.querySelector('.current-all');

    // Move the player
    let newRow, newCol;
    switch (direction) {
      case 'up':
        newRow = playerRow - 1;
        newCol = playerCol;
        break;
      case 'down':
        newRow = playerRow + 1;
        newCol = playerCol;
        break;
      case 'left':
        newRow = playerRow;
        newCol = playerCol - 1;
        break;
      case 'right':
        newRow = playerRow;
        newCol = playerCol + 1;
        break;
    }

    if (newRow >= 0 && newRow < maze.length && newCol >= 0 && newCol < maze[0].length && maze[newRow][newCol] === 0) {
      if (currentPlayerCell) currentPlayerCell.classList?.remove('current-all');
      // Update the player's position
      playerRow = newRow;
      playerCol = newCol;
      mazeCount[`${newRow}-${newCol}`] = (mazeCount[`${newRow}-${newCol}`] || 0) + 1;
      // Redraw the maze
      drawMaze(maze);
      // Check if the player has won
      if (checkWin()) {
        // Display the result
        document.getElementById('result').innerText = 'YOU GOT!';
        localStorage.setItem('size', size + 2);
        localStorage.removeItem('maze');
        document.getElementById('next').style.display = 'block';

        // Reset the maze
        mazeCount = {};
        playerCol = 0;
        playerRow = 0;
      }
      saveMaze();
    }
  }

  // Save the maze status to local storage
  function saveMaze() {
    localStorage.setItem('playerRow', playerRow);
    localStorage.setItem('playerCol', playerCol);
    localStorage.setItem('mazeCount', JSON.stringify(mazeCount));
  }
})()

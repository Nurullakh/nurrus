import { useState } from "react";

export const data = {
  "file.txt": true,
  dir1: {
    subdir1: {
      "file0.txt": true,
    },
    subdir2: {
      "file1.txt": true,
    },
  },
  dir2: {
    "file2.txt": true,
    "file3.txt": true,
    subdir3: {},
  },
  dir3: {},
};

const Entry = ({name, value, path, onDelete}) => {
  const [open, setOpen] = useState(true)
  const isFolder = typeof value === 'object'
  
  return (
    <div className="ml-4">
      <div>
        {isFolder && <span>{open ? '-' : '+'}</span>}
        <span>{name}</span>
        <span onClick={deleteHandler}>x</span>
      </div>
    </div>
  )
}

const Kek = () => {
  const [tree, setTree] = useState(data)

  return (
    <div>he</div>
  )
}

export default Kek
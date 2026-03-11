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

const Entry = ({ name, value, path, onDelete }) => {
  const [open, setOpen] = useState(true);
  const isFolder = typeof value === "object";

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(path);
  };

  return (
    <div className="ml-4">
      <div
        className={`flex items-center gap-1 mb-1 cursor-pointer group select-none ${
          isFolder ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
        } px-2 py-1 rounded`}
        onClick={() => isFolder && setOpen(!open)}
      >
        {isFolder && <span className="text-lg w-4">{open ? "−" : "+"}</span>}
        <span className="flex-1">{name}</span>
        <span
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 cursor-pointer"
        >
          ×
        </span>
      </div>
      {isFolder && open && (
        <div className="ml-4">
          {Object.entries(value).map(([k, v]) => (
            <Entry
              key={k}
              name={k}
              value={v}
              path={[...path, k]}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const setDeep = (obj, path, val) => {
  const key = path[0];
  if (path.length === 1) {
    obj[key] = val;
  } else {
    if (!obj[key] || typeof obj[key] !== "object") obj[key] = {};
    setDeep(obj[key], path.slice(1), val);
  }
};

const deleteDeep = (obj, path) => {
  const key = path[0];
  if (path.length === 1) {
    delete obj[key];
  } else {
    deleteDeep(obj[key], path.slice(1));
    if (Object.keys(obj[key]).length === 0) delete obj[key];
  }
};

const filterData = (obj, term) => {
  if (!term) return obj;
  const result = {};
  for (let [k, v] of Object.entries(obj)) {
    if (k.includes(term)) {
      result[k] = v;
    } else if (typeof v === "object") {
      const filtered = filterData(v, term);
      if (Object.keys(filtered).length) result[k] = filtered;
    }
  }
  return result;
};

export default function FileExplorer() {
  const [tree, setTree] = useState(data);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");

  const handleCreate = () => {
    if (!input) return;
    const path = input.split("/");
    const name = path[path.length - 1];
    const newTree = structuredClone(tree);
    setDeep(newTree, path, name.includes(".") ? true : {});
    setTree(newTree);
    setInput("");
  };

  const handleDelete = (path) => {
    const newTree = structuredClone(tree);
    deleteDeep(newTree, path);
    setTree(newTree);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
      <input
        className="border p-2 w-full rounded mb-2"
        placeholder="Введите название"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        onClick={handleCreate}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Создать
      </button>
      <input
        className="border p-2 w-full rounded mb-4"
        placeholder="Поиск"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Entry
        name="root"
        value={filterData(tree, search)}
        path={[]}
        onDelete={handleDelete}
      />
    </div>
  );
}

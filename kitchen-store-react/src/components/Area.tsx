import { useState } from "react"

interface TodoItem {
  todoId: number;
  text: string;
  completed: boolean;
}

interface TodoItemProps extends TodoItem {
  onClickTodo: (id: number, completed: boolean) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todoId, text, completed, onClickTodo }) => {
  const onClick = () => {
    onClickTodo(todoId, !completed)
  }
  return (
    <div onClick={onClick} style={completed ? {
      textDecoration: 'line-through'
    } : {}}> {text}</div >
  )
}

const TodoForm = ({ addTodo }: { addTodo: (value: string) => void }) => {
  const [value, setValue] = useState('')

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (value.length) {
      addTodo(value)
      setValue('')
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input type="text" value={value} onInput={handleChange} />
      <button>Добавить</button>
    </form>
  )
}

const TodoList = () => {
  const [todos, setTodos] = useState<TodoItem[]>([])

  const onClickTodo = (id: number, completed: boolean) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.todoId === id ? { ...todo, completed: completed } : todo
      )
    );
  }

  const addTodo = (value: string) => {
    const todo = { text: value, completed: false, todoId: Date.now() }

    setTodos([...todos, todo])
  }
  return (
    <div>
      <div>
        <TodoForm addTodo={addTodo} />
      </div>
      {todos.map(todo => (
        <TodoItem {...todo} onClickTodo={onClickTodo} />
      ))}
    </div>
  )
}

export default TodoList
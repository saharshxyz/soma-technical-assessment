"use client"
import { useState, useEffect } from 'react';

type FrontendTodo = {
  id: number;
  title: string;
  createdAt: string | Date;
  dueDate: string | Date | null;
  imageUrl: string | null;
  imageAlt: string | null;
  isLoading?: boolean;
};

export default function Home() {
  const [newTodo, setNewTodo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [todos, setTodos] = useState<FrontendTodo[]>([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch('/api/todos');
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    }
  };

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;

    const optimisticTodo: FrontendTodo = {
      id: Date.now(),
      title: newTodo,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdAt: new Date(),
      imageUrl: null,
      imageAlt: null,
      isLoading: true,
    };
    setTodos(currentTodos => [optimisticTodo, ...currentTodos]);

    const todoTitle = newTodo;
    const todoDueDate = dueDate;

    setNewTodo('');
    setDueDate('');

    try {
      await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: todoTitle, dueDate: todoDueDate }),
      });
      fetchTodos();
    } catch (error) {
      console.error('Failed to add todo:', error);
      setTodos(currentTodos => currentTodos.filter(t => t.id !== optimisticTodo.id));
    }
  };

  const handleDeleteTodo = async (id: number) => {
    const originalTodos = todos;
    try {
      setTodos(currentTodos => currentTodos.filter(todo => todo.id !== id));
      await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete todo:', error);
      setTodos(originalTodos);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500 to-red-500 flex flex-col items-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-white mb-8">Things To Do App</h1>
        <div className="flex mb-6">
          <input
            type="text"
            className="flex-grow p-3 rounded-l-full focus:outline-none text-gray-700"
            placeholder="Add a new todo"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}

          />
          <input
            type="date"
            className="p-3 focus:outline-none text-gray-700"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <button
            onClick={handleAddTodo}
            className="bg-white text-indigo-600 p-3 rounded-r-full hover:bg-gray-100 transition duration-300"
          >
            Add
          </button>
        </div>
        <ul>
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex flex-col bg-white bg-opacity-90 p-4 mb-4 rounded-lg shadow-lg"
            >
              {todo.isLoading ? (
                <div className="w-full aspect-[2/1] bg-gray-200 rounded-md animate-pulse mb-4"></div>
              ) : todo.imageUrl ? (
                <div className="w-full aspect-[2/1] overflow-hidden rounded-md mb-4">
                  <img
                    src={todo.imageUrl}
                    alt={todo.imageAlt || `Image for ${todo.title}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : null}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-gray-800 font-semibold">{todo.title}</span>
                  {todo.dueDate && (
                    <p className={`text-sm ${new Date(todo.dueDate) < new Date() ? 'text-red-500' : 'text-gray-500'}`}>
                      Due: {new Date(todo.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-700 transition duration-300 flex-shrink-0 ml-4"
                >
                  {/* Delete Icon */}
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

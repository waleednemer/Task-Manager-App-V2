import React, { useEffect, useState } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

function TaskForm({ onSave, initial }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [priority, setPriority] = useState(initial?.priority || 'medium');
  const [dueDate, setDueDate] = useState(initial?.dueDate ? initial?.dueDate.split('T')[0] : '');

  useEffect(()=>{
    setTitle(initial?.title || '');
    setDescription(initial?.description || '');
    setPriority(initial?.priority || 'medium');
    setDueDate(initial?.dueDate ? initial?.dueDate.split('T')[0] : '');
  }, [initial]);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert('الرجاء إدخال عنوان');
    await onSave({ title: title.trim(), description: description.trim(), priority, dueDate: dueDate || null });
    setTitle(''); setDescription(''); setPriority('medium'); setDueDate('');
  };

  return (
  <div className="w-full max-w-lg mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-7 border border-gray-100">
  <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center flex items-center gap-2 justify-center">
    ✨ مهمة جديدة
  </h2>

  <form onSubmit={submit} className="space-y-5">

    <div>
      <label className="text-gray-600 text-sm">عنوان المهمة</label>
      <input 
        value={title}
        onChange={e=>setTitle(e.target.value)}
        placeholder="مثال: مراجعة مشروع اليوم"
        className="mt-1 w-full p-3 border border-gray-200 rounded-2xl bg-white
        focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
    </div>

    <div>
      <label className="text-gray-600 text-sm">الوصف (اختياري)</label>
      <textarea 
        value={description}
        onChange={e=>setDescription(e.target.value)}
        placeholder="تفاصيل سريعة للمهمة…"
        rows="2"
        className="mt-1 w-full p-3 border border-gray-200 rounded-2xl bg-white
        focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
    </div>

    <div className="flex gap-3">
      <div className="w-1/2">
        <label className="text-gray-600 text-sm">الأولوية</label>
        <select
          value={priority}
          onChange={e=>setPriority(e.target.value)}
          className="mt-1 w-full p-3 border border-gray-200 rounded-2xl bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <option value="low">منخفضة</option>
          <option value="medium">متوسطة</option>
          <option value="high">مرتفعة</option>
        </select>
      </div>

      <div className="w-1/2">
        <label className="text-gray-600 text-sm">تاريخ التسليم</label>
        <input
          type="date"
          value={dueDate}
          onChange={e=>setDueDate(e.target.value)}
          className="mt-1 w-full p-3 border border-gray-200 rounded-2xl bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
    </div>

    <button 
      className="w-full bg-blue-600 text-white py-3 rounded-2xl font-semibold
      hover:bg-blue-700 active:scale-95 transition-all shadow-md text-lg flex items-center justify-center gap-2"
    >
      💾 حفظ المهمة
    </button>
  </form>
</div>


  );
}

function TaskItem({ task, onDelete, onToggle, onEdit }) {
  return (
    <div className="bg-white p-4 rounded shadow-sm flex items-start justify-between">
      <div>
        <div className="flex items-center gap-3">
          <input type="checkbox" checked={task.completed} onChange={()=>onToggle(task)} />
          <h3 className={task.completed ? 'line-through text-slate-400' : 'font-semibold'}>{task.title}</h3>
        </div>
        {task.description && <p className="text-sm text-slate-600 mt-1">{task.description}</p>}
        <small className="text-xs text-slate-400">{new Date(task.createdAt).toLocaleString()}</small>
      </div>
      <div className="flex gap-2">
        <button onClick={()=>onEdit(task)} className="px-3 py-1 border rounded">تعديل</button>
        <button onClick={()=>onDelete(task._id)} className="px-3 py-1 bg-red-500 text-white rounded">حذف</button>
      </div>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    const res = await api.get('/tasks');
    setTasks(res.data);
    setLoading(false);
  };

  useEffect(()=> { fetchTasks(); }, []);

  const createTask = async (payload) => {
    const res = await api.post('/tasks', payload);
    setTasks(prev => [res.data, ...prev]);
  };

  const updateTask = async (id, payload) => {
    const res = await api.put(`/tasks/${id}`, payload);
    setTasks(prev => prev.map(t => t._id === id ? res.data : t));
    setEditing(null);
  };

  const deleteTask = async (id) => {
    if (!confirm('هل تريد حذف المهمة؟')) return;
    await api.delete(`/tasks/${id}`);
    setTasks(prev => prev.filter(t => t._id !== id));
  };

  const toggleComplete = async (task) => {
    await api.put(`/tasks/${task._id}`, {...task, completed: !task.completed});
    setTasks(prev => prev.map(t => t._id === task._id ? {...t, completed: !t.completed} : t));
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">إدارة المهام</h1>
          <div className="text-sm text-slate-500">واجهة احترافية + API جاهز</div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-1 bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">{editing ? 'تعديل مهمة' : 'إضافة مهمة جديدة'}</h2>
            <TaskForm onSave={async (data)=> {
              if (editing) await updateTask(editing._id, {...editing, ...data});
              else await createTask(data);
            }} initial={editing} />
            {editing && <button onClick={()=>setEditing(null)} className="mt-3 text-sm">إلغاء التعديل</button>}
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">المهام</h2>
              <div className="text-sm text-slate-500">{tasks.length} مهمة</div>
            </div>

            <div className="space-y-3">
              {loading ? <div>جاري التحميل...</div> : tasks.length === 0 ? <div className="text-slate-500">لا توجد مهام</div> :
                tasks.map(t => (
                  <TaskItem key={t._id} task={t} onDelete={deleteTask} onToggle={toggleComplete} onEdit={setEditing} />
                ))
              }
            </div>
          </div>
        </section>

        <footer className="text-center text-xs text-slate-400 mt-8">تم الإنشاء باستخدام React + Vite + Express + MongoDB + Tailwind</footer>
      </div>
    </div>
  );
}

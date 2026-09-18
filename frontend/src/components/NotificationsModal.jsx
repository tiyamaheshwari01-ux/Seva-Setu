import { Bell, CheckCircle2, Bot, Tag, ShieldCheck, X } from "lucide-react";

export default function NotificationsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      type: "success",
      icon: <CheckCircle2 size={16} className="text-green" />,
      title: "WhatsApp Broadcast Delivered",
      time: "Just now",
      description: "Weekend Family Basket Flash Sale reached 5 customers (100% delivery rate).",
    },
    {
      id: 2,
      type: "info",
      icon: <Tag size={16} className="text-blue" />,
      title: "Paytm Promotional Voucher Generated",
      time: "10 mins ago",
      description: "Coupon code SEVA15 generated for Paytm UPI checkout.",
    },
    {
      id: 3,
      type: "agent",
      icon: <Bot size={16} className="text-purple" />,
      title: "Business Analyst Alert",
      time: "1 hour ago",
      description: "Saturday sales drop (-39%) detected. Multi-agent strategy initiated.",
    },
    {
      id: 4,
      type: "guardrail",
      icon: <ShieldCheck size={16} className="text-green" />,
      title: "Safety Guardrails Verified",
      time: "2 hours ago",
      description: "Execution Agent confirmed profit margin safety before dispatch.",
    },
  ];

  return (
    <div className="notifications-dropdown card" onClick={(e) => e.stopPropagation()}>
      <div className="notifications-header">
        <div className="notif-title-row">
          <Bell size={16} className="text-blue" />
          <strong>System & Agent Activity</strong>
        </div>
        <button className="icon-btn-close" onClick={onClose}>
          <X size={15} />
        </button>
      </div>

      <div className="notifications-list">
        {notifications.map((n) => (
          <div key={n.id} className="notification-item">
            <div className="notif-icon-box">{n.icon}</div>
            <div className="notif-content">
              <div className="notif-row">
                <strong>{n.title}</strong>
                <span className="notif-time">{n.time}</span>
              </div>
              <p>{n.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

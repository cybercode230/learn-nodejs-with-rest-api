export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  phone: string;
  role: "host" | "guest";
  avatar?: string;
  bio?: string;
}

export const users: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    username: "johndoe",
    phone: "123-456-7890",
    role: "host",
    avatar: "https://i.pravatar.cc/150?u=1",
    bio: "Love traveling and meeting new people."
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    username: "janesmith",
    phone: "987-654-3210",
    role: "guest",
    avatar: "https://i.pravatar.cc/150?u=2",
    bio: "Frequent traveler and foodie."
  },
  {
    id: 3,
    name: "Alice Johnson",
    email: "alice@example.com",
    username: "alicej",
    phone: "555-0199",
    role: "guest",
    avatar: "https://i.pravatar.cc/150?u=3"
  }
];

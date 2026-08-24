export interface IMessage {
  id: string;
  senderId: string;
  title: string;
  body: string;
  courseId: string | null;
  isGlobal: boolean;
  read: boolean;
  createdAt: string;
}

import { Context, Next } from "koa"

declare namespace Art {
  type Article = {
    id: number;
    title: string;
    content: string;
    introduction: string;
    tags: string;
    type: number;
    images: string;
    view_count: number | null;
    like_count: number | null;
    comment_count: number | null;
    create_time: number;
    edit_time: number;
  }
}

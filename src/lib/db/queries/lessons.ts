import { db } from "@/lib/db";
import { lessons, modules, levels, exercises } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export function getModulesByLevel(levelCode: string) {
  return db
    .select({
      module: modules,
      level: levels,
    })
    .from(modules)
    .innerJoin(levels, eq(modules.levelId, levels.id))
    .where(eq(levels.code, levelCode))
    .orderBy(modules.order)
    .all();
}

export function getLessonsByModule(moduleId: number) {
  return db
    .select()
    .from(lessons)
    .where(eq(lessons.moduleId, moduleId))
    .orderBy(lessons.order)
    .all();
}

export function getLessonById(id: number) {
  return db.select().from(lessons).where(eq(lessons.id, id)).get();
}

export function getExercisesByLesson(lessonId: number) {
  return db
    .select()
    .from(exercises)
    .where(eq(exercises.lessonId, lessonId))
    .all();
}

export function getAllModulesWithLessons() {
  const allModules = db
    .select({
      module: modules,
      level: levels,
    })
    .from(modules)
    .innerJoin(levels, eq(modules.levelId, levels.id))
    .orderBy(levels.order, modules.order)
    .all();

  return allModules.map((row) => {
    const moduleLessons = db
      .select()
      .from(lessons)
      .where(eq(lessons.moduleId, row.module.id))
      .orderBy(lessons.order)
      .all();

    return {
      ...row.module,
      levelCode: row.level.code,
      lessons: moduleLessons,
    };
  });
}

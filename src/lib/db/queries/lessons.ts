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
  // 1 seule requête JOIN au lieu de N+1 (1 par module)
  const rows = db
    .select({
      module: modules,
      level: levels,
      lesson: lessons,
    })
    .from(modules)
    .innerJoin(levels, eq(modules.levelId, levels.id))
    .leftJoin(lessons, eq(lessons.moduleId, modules.id))
    .orderBy(levels.order, modules.order, lessons.order)
    .all();

  // Regrouper les leçons par module côté JS
  const moduleMap = new Map<number, { id: number; levelId: number; title: string; description: string; order: number; isUnlocked: boolean; levelCode: string; lessons: typeof rows[0]["lesson"][] }>();

  for (const row of rows) {
    if (!moduleMap.has(row.module.id)) {
      moduleMap.set(row.module.id, {
        ...row.module,
        levelCode: row.level.code,
        lessons: [],
      });
    }
    if (row.lesson) {
      moduleMap.get(row.module.id)!.lessons.push(row.lesson);
    }
  }

  return Array.from(moduleMap.values());
}

import { getTranslations } from "next-intl/server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import {
  submitAddLmsPathCourse,
  submitCreateLmsLearningPath,
  submitRemoveLmsPathCourse,
  submitUpdateLmsLearningPath,
} from "../actions/lms-learning-path.actions"
import { listLmsPathCoursesForPath } from "../data/lms-learning-paths.queries.server"
import type {
  HrmLmsCourseRow,
  HrmLmsLearningPathRow,
} from "../data/lms.types.shared"
import { HRM_LMS_PATH_TYPE_OPTIONS } from "../schemas/lms.schema"

type LmsLearningPathAdminFormsProps = {
  orgSlug: string
  organizationId: string
  courses: readonly HrmLmsCourseRow[]
  paths: readonly HrmLmsLearningPathRow[]
}

export async function LmsLearningPathAdminForms({
  orgSlug,
  organizationId,
  courses,
  paths,
}: LmsLearningPathAdminFormsProps) {
  const t = await getTranslations("Erp.Hrm.lms")
  const activePaths = paths.filter((p) => p.state !== "archived")
  const activeCourses = courses.filter((c) => c.state !== "archived")

  const pathCourseRows = await Promise.all(
    activePaths.map(async (path) => ({
      path,
      courses: await listLmsPathCoursesForPath({
        organizationId,
        learningPathId: path.id,
      }),
    }))
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-base">{t("createPathTitle")}</CardTitle>
            <CardDescription>{t("createPathDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={submitCreateLmsLearningPath}
              className="grid max-w-md gap-3"
            >
              <input
                type="hidden"
                name="organizationId"
                value={organizationId}
              />
              <input type="hidden" name="orgSlug" value={orgSlug} />
              <label className="grid gap-1 text-sm">
                <span className="text-muted-foreground">
                  {t("fieldPathCode")}
                </span>
                <input
                  name="code"
                  required
                  className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-muted-foreground">
                  {t("fieldPathName")}
                </span>
                <input
                  name="name"
                  required
                  className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-muted-foreground">
                  {t("fieldPathType")}
                </span>
                <select
                  name="pathType"
                  defaultValue="role"
                  className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {HRM_LMS_PATH_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {t(`pathType.${type}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-muted-foreground">
                  {t("fieldDescription")}
                </span>
                <textarea
                  name="description"
                  rows={2}
                  className="flex min-h-9 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                {t("createPathSubmit")}
              </button>
            </form>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-base">
              {t("addPathCourseTitle")}
            </CardTitle>
            <CardDescription>{t("addPathCourseDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={submitAddLmsPathCourse}
              className="grid max-w-md gap-3"
            >
              <input
                type="hidden"
                name="organizationId"
                value={organizationId}
              />
              <input type="hidden" name="orgSlug" value={orgSlug} />
              <label className="grid gap-1 text-sm">
                <span className="text-muted-foreground">
                  {t("fieldLearningPath")}
                </span>
                <select
                  name="learningPathId"
                  required
                  className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">{t("fieldLearningPathPlaceholder")}</option>
                  {activePaths.map((path) => (
                    <option key={path.id} value={path.id}>
                      {path.code} — {path.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-muted-foreground">
                  {t("fieldCourse")}
                </span>
                <select
                  name="courseId"
                  required
                  className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">{t("fieldCoursePlaceholder")}</option>
                  {activeCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} — {course.title}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                {t("addPathCourseSubmit")}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>

      {activePaths.length > 0 ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-base">{t("updatePathTitle")}</CardTitle>
            <CardDescription>{t("updatePathDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 divide-y">
            {activePaths.map((path) => (
              <form
                key={path.id}
                action={submitUpdateLmsLearningPath}
                className="grid max-w-2xl gap-3 pt-4 first:pt-0"
              >
                <input
                  type="hidden"
                  name="organizationId"
                  value={organizationId}
                />
                <input type="hidden" name="orgSlug" value={orgSlug} />
                <input type="hidden" name="learningPathId" value={path.id} />
                <p className="text-sm font-medium">
                  {path.code} — {path.name}
                </p>
                <label className="grid gap-1 text-sm">
                  <span className="text-muted-foreground">
                    {t("fieldPathName")}
                  </span>
                  <input
                    name="name"
                    required
                    defaultValue={path.name}
                    className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="text-muted-foreground">
                    {t("fieldPathType")}
                  </span>
                  <select
                    name="pathType"
                    defaultValue={path.pathType}
                    className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {HRM_LMS_PATH_TYPE_OPTIONS.map((type) => (
                      <option key={type} value={type}>
                        {t(`pathType.${type}`)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="text-muted-foreground">
                    {t("fieldDescription")}
                  </span>
                  <textarea
                    name="description"
                    rows={2}
                    defaultValue={path.description ?? ""}
                    className="flex min-h-9 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex h-9 w-fit items-center rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground"
                >
                  {t("updatePathSubmit")}
                </button>
              </form>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {pathCourseRows.length > 0 ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-base">
              {t("pathSequenceTitle")}
            </CardTitle>
            <CardDescription>{t("pathSequenceDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {pathCourseRows.map(({ path, courses: ordered }) => (
              <div key={path.id} className="flex flex-col gap-2">
                <p className="text-sm font-medium">
                  {path.code} — {path.name}
                </p>
                {ordered.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("pathSequenceEmpty")}
                  </p>
                ) : (
                  <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm">
                    {ordered.map((row) => (
                      <li key={row.id} className="flex items-center gap-3">
                        <span>
                          {row.courseCode} — {row.courseTitle}
                        </span>
                        <form action={submitRemoveLmsPathCourse}>
                          <input
                            type="hidden"
                            name="organizationId"
                            value={organizationId}
                          />
                          <input type="hidden" name="orgSlug" value={orgSlug} />
                          <input
                            type="hidden"
                            name="pathCourseId"
                            value={row.id}
                          />
                          <button
                            type="submit"
                            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                          >
                            {t("removePathCourse")}
                          </button>
                        </form>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

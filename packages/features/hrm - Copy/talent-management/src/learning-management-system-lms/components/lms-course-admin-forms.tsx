import { getTranslations } from "next-intl/server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import { submitCreateLmsContentRef } from "../actions/lms-content-ref.actions"
import {
  submitCreateLmsCourse,
  submitUpdateLmsCourse,
} from "../actions/lms-course.actions"
import {
  HRM_LMS_CONTENT_REF_TYPE_OPTIONS,
  HRM_LMS_COURSE_TYPE_OPTIONS,
} from "../schemas/lms.schema"
import type { HrmLmsCourseRow } from "../data/lms.types.shared"

type LmsCourseAdminFormsProps = {
  orgSlug: string
  organizationId: string
  courses: readonly HrmLmsCourseRow[]
}

export async function LmsCourseAdminForms({
  orgSlug,
  organizationId,
  courses,
}: LmsCourseAdminFormsProps) {
  const t = await getTranslations("Erp.Hrm.lms")

  const activeCourses = courses.filter((c) => c.state !== "archived")

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-base">{t("createCourseTitle")}</CardTitle>
          <CardDescription>{t("createCourseDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={submitCreateLmsCourse} className="grid max-w-md gap-3">
            <input type="hidden" name="organizationId" value={organizationId} />
            <input type="hidden" name="orgSlug" value={orgSlug} />
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">{t("fieldCode")}</span>
              <input
                name="code"
                required
                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">{t("fieldTitle")}</span>
              <input
                name="title"
                required
                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">
                {t("fieldCourseType")}
              </span>
              <select
                name="courseType"
                defaultValue="online_course"
                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {HRM_LMS_COURSE_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {t(`courseType.${type}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">
                {t("fieldDeliveryMode")}
              </span>
              <input
                name="deliveryMode"
                defaultValue="online"
                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">
                {t("fieldCategory")}
              </span>
              <input
                name="category"
                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">
                {t("fieldDescription")}
              </span>
              <textarea
                name="description"
                rows={2}
                className="flex min-h-16 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              className="inline-flex h-9 w-fit items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              {t("createCourseSubmit")}
            </button>
          </form>
        </CardContent>
      </Card>

      {activeCourses.length > 0 ? (
        <Card size="sm" className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              {t("updateCourseTitle")}
            </CardTitle>
            <CardDescription>{t("updateCourseDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 divide-y">
            {activeCourses.map((course) => (
              <form
                key={course.id}
                action={submitUpdateLmsCourse}
                className="grid max-w-2xl gap-3 pt-4 first:pt-0"
              >
                <input
                  type="hidden"
                  name="organizationId"
                  value={organizationId}
                />
                <input type="hidden" name="orgSlug" value={orgSlug} />
                <input type="hidden" name="courseId" value={course.id} />
                <p className="text-sm font-medium">
                  {course.code} — {course.title}
                </p>
                <label className="grid gap-1 text-sm">
                  <span className="text-muted-foreground">
                    {t("fieldTitle")}
                  </span>
                  <input
                    name="title"
                    required
                    defaultValue={course.title}
                    className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="text-muted-foreground">
                    {t("fieldCategory")}
                  </span>
                  <input
                    name="category"
                    defaultValue={course.category ?? ""}
                    className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="text-muted-foreground">
                    {t("fieldDescription")}
                  </span>
                  <textarea
                    name="description"
                    rows={2}
                    defaultValue={course.description ?? ""}
                    className="flex min-h-16 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="selfEnrollAllowed"
                    defaultChecked={course.selfEnrollAllowed}
                  />
                  <span>{t("fieldSelfEnrollAllowed")}</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="approvalRequired"
                    defaultChecked={course.approvalRequired}
                  />
                  <span>{t("fieldApprovalRequired")}</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="complianceMandatory"
                    defaultChecked={course.complianceMandatory}
                  />
                  <span>{t("fieldComplianceMandatory")}</span>
                </label>
                <button
                  type="submit"
                  className="inline-flex h-9 w-fit items-center rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground"
                >
                  {t("updateCourseSubmit")}
                </button>
              </form>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-base">{t("contentRefTitle")}</CardTitle>
          <CardDescription>{t("contentRefDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={submitCreateLmsContentRef}
            className="grid max-w-md gap-3"
          >
            <input type="hidden" name="organizationId" value={organizationId} />
            <input type="hidden" name="orgSlug" value={orgSlug} />
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">{t("fieldCourse")}</span>
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
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">{t("fieldRefType")}</span>
              <select
                name="refType"
                defaultValue="internal"
                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {HRM_LMS_CONTENT_REF_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {t(`contentRefType.${type}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">
                {t("fieldRefLabel")}
              </span>
              <input
                name="label"
                required
                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">
                {t("fieldLaunchUrl")}
              </span>
              <input
                name="launchUrl"
                type="url"
                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">
                {t("fieldPackageRef")}
              </span>
              <input
                name="packageRef"
                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">
                {t("fieldContentStandard")}
              </span>
              <input
                name="contentStandard"
                placeholder="SCORM 1.2"
                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>
            <button
              type="submit"
              className="inline-flex h-9 w-fit items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              {t("contentRefSubmit")}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

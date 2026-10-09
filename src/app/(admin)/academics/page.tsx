"use client"

import { PageHeader } from "@/components/shared/page-header"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CLASSES, SUBJECTS } from "@/lib/mock/academics"
import { Plus } from "lucide-react"
import { StatusBadge } from "@/components/shared/status-badge"

export default function AcademicsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes & Subjects"
        actions={<Button data-icon="inline-start"><Plus className="size-4 mr-2" /> Add Class</Button>}
      />

      <Tabs defaultValue="classes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
        </TabsList>

        <TabsContent value="classes">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CLASSES.map((cls: any) => (
              <Card key={cls.id || cls.className}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{cls.className}</CardTitle>
                      <CardDescription>Grade {cls.gradeLevel} • {cls.campus}</CardDescription>
                    </div>
                    {cls.stream && <Badge variant="secondary">{cls.stream}</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm text-center">
                    <div className="flex flex-col p-2 bg-muted rounded-md">
                      <span className="font-medium">{cls.sectionsCount || cls.sections}</span>
                      <span className="text-muted-foreground text-xs">Sections</span>
                    </div>
                    <div className="flex flex-col p-2 bg-muted rounded-md">
                      <span className="font-medium">{cls.studentsCount || cls.students}</span>
                      <span className="text-muted-foreground text-xs">Students</span>
                    </div>
                    <div className="flex flex-col p-2 bg-muted rounded-md">
                      <span className="font-medium">{cls.subjectsCount || cls.subjects}</span>
                      <span className="text-muted-foreground text-xs">Subjects</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Class Teacher</span>
                    <span className="font-medium">{cls.classTeacher || cls.teacher}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <StatusBadge status={cls.status || "Active"} tone={(cls.status || "Active") === "Active" ? "success" : "neutral"} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subjects">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Marks (Max/Pass)</TableHead>
                  <TableHead>Teacher</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SUBJECTS.map((subject: any) => (
                  <TableRow key={subject.id || subject.code}>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>{subject.code}</TableCell>
                    <TableCell>{subject.class || subject.classes?.join(", ") || "-"}</TableCell>
                    <TableCell>
                      {subject.isElective ? <Badge variant="outline">Elective</Badge> : <Badge variant="secondary">Core</Badge>}
                    </TableCell>
                    <TableCell>{subject.maxMarks || 100} / {subject.passMarks || 40}</TableCell>
                    <TableCell>{subject.teacher || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

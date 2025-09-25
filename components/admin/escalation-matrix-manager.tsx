"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Save } from "lucide-react"
import { EscalationMatrix } from "@/lib/data-store"
import { toast } from "sonner"

interface EscalationMatrixManagerProps {
  initialData: EscalationMatrix[]
}

export default function EscalationMatrixManager({ initialData }: EscalationMatrixManagerProps) {
  const [escalationMatrix, setEscalationMatrix] = useState<EscalationMatrix[]>(initialData)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<EscalationMatrix | null>(null)
  const [selectedEntries, setSelectedEntries] = useState<string[]>([])
  const [formData, setFormData] = useState({
    level: 1,
    position: "",
    name: "",
    mobile: "",
    email: ""
  })

  const handleAdd = () => {
    setEditingEntry(null)
    setFormData({ level: escalationMatrix.length + 1, position: "", name: "", mobile: "", email: "" })
    setIsDialogOpen(true)
  }

  const handleEdit = (entry: EscalationMatrix) => {
    setEditingEntry(entry)
    setFormData({
      level: entry.level,
      position: entry.position,
      name: entry.name,
      mobile: entry.mobile,
      email: entry.email
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingEntry) {
        // Update existing entry
        const updatedMatrix = escalationMatrix.map(item => 
          item.id === editingEntry.id ? { ...item, ...formData } : item
        )
        
        const response = await fetch('/api/admin/escalation-matrix', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ escalationMatrix: updatedMatrix })
        })
        
        if (response.ok) {
          setEscalationMatrix(updatedMatrix)
          setIsDialogOpen(false)
          toast.success('Entry updated successfully')
        } else {
          toast.error('Failed to update entry')
        }
      } else {
        // Add new entry
        const response = await fetch('/api/admin/escalation-matrix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        
        if (response.ok) {
          const result = await response.json()
          setEscalationMatrix(prev => [...prev, { ...formData, id: Date.now().toString() }])
          setIsDialogOpen(false)
          toast.success('Entry added successfully')
        } else {
          toast.error('Failed to add entry')
        }
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const updatedMatrix = escalationMatrix.filter(item => item.id !== id)
      
      const response = await fetch('/api/admin/escalation-matrix', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escalationMatrix: updatedMatrix })
      })

      if (response.ok) {
        setEscalationMatrix(updatedMatrix)
        toast.success('Entry deleted successfully')
      } else {
        toast.error('Failed to delete entry')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedEntries.length === 0) return
    
    try {
      const deletePromises = selectedEntries.map(id => 
        fetch(`/api/admin/escalation-matrix?id=${id}`, { method: 'DELETE' })
      )
      
      const responses = await Promise.all(deletePromises)
      const allSuccessful = responses.every(response => response.ok)
      
      if (allSuccessful) {
        setEscalationMatrix(prev => prev.filter(item => !selectedEntries.includes(item.id)))
        setSelectedEntries([])
        toast.success(`${selectedEntries.length} entries deleted successfully`)
      } else {
        toast.error('Some entries failed to delete')
      }
    } catch (error) {
      toast.error('An error occurred during bulk delete')
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEntries(escalationMatrix.map(entry => entry.id))
    } else {
      setSelectedEntries([])
    }
  }

  const handleSelectEntry = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedEntries(prev => [...prev, id])
    } else {
      setSelectedEntries(prev => prev.filter(entryId => entryId !== id))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            Manage escalation contacts that will be displayed to all agencies
          </p>
          {selectedEntries.length > 0 && (
            <p className="text-sm text-blue-600 mt-1">
              {selectedEntries.length} item(s) selected
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {selectedEntries.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedEntries.length})
            </Button>
          )}
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedEntries.length === escalationMatrix.length && escalationMatrix.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Position/Designation</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
              {escalationMatrix.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedEntries.includes(entry.id)}
                      onCheckedChange={(checked) => handleSelectEntry(entry.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{entry.position || entry.role || 'N/A'}</TableCell>
                  <TableCell className="text-muted-foreground">Level {entry.level || entry.priority || 1}</TableCell>
                  <TableCell>{entry.name}</TableCell>
                  <TableCell>{entry.mobile || entry.phone || 'N/A'}</TableCell>
                  <TableCell>{entry.email}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(entry)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'Edit Escalation Contact' : 'Add Escalation Contact'}
            </DialogTitle>
            <DialogDescription>
              This contact will be visible to all agencies in their dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="position" className="text-sm font-medium">
                Position/Designation
              </Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                placeholder="e.g., Customer Support Representative, Manager, Director"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="level" className="text-sm font-medium">
                Level
              </Label>
              <Input
                id="level"
                type="number"
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                min="1"
                max="10"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mobile" className="text-sm font-medium">
                Mobile
              </Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                placeholder="Enter mobile number"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {editingEntry ? 'Update' : 'Add'} Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
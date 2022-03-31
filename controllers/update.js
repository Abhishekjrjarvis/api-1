require("dotenv").config();
const Department = require("../models/Department");
const InstituteAdmin = require("../models/InstituteAdmin");
const Class = require("../models/Class");
const ClassMaster = require("../models/ClassMaster");
const SubjectMaster = require("../models/SubjectMaster");
const Subject = require("../models/Subject");
const Checklist = require("../models/Checklist");
const Fees = require("../models/Fees");
const Holiday = require("../models/Holiday");
const StudentProfile = require("../models/Student");
const StaffProfile = require("../models/Staff");
const Batch = require("../models/Batch");
const Exam = require("../models/Exam");
const Staff = require("../models/Staff");
const StaffAttendence = require("../models/StaffAttendence");
const Attendence = require("../models/Attendence");
const AttendenceDate = require("../models/AttendenceDate");
const StaffAttendenceDate = require("../models/StaffAttendenceDate");

exports.getDepartment = async (req, res) => {
  try {
    const depart = await Department.findById(req.params.did);
    res.status(200).send({
      data: depart,
    });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/getDepartment/did)`);
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const depart = await Department.findById(req.params.did);
    const oldStaffId = await Staff.findById(depart.dHead);
    const newStaffId = req.body.dHead;
    const data = {
      dName: req.body.dName,
      dTitle: req.body.dTitle,
      dHead: req.body.dHead,
    };
    await Department.findByIdAndUpdate(req.params.did, data);
    await oldStaffId.staffDepartment.pull(req.params.did);
    await oldStaffId.save();
    const newStaff = await Staff.findById(newStaffId);
    await newStaff.staffDepartment.push(req.params.did);
    await newStaff.save();

    res.status(200).send({
      message: "updated",
    });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(updateDepartment)`);
  }
};

exports.delDepartment = async (req, res) => {
  try {
    const depart = await Department.findById(req.params.did);
    const staffDepart = await Staff.findById({ _id: depart.dHead });
    await staffDepart.staffDepartment.pull(req.params.did);

    await StaffAttendenceDate.deleteMany({ department: req.params.did });

    await StaffAttendence.deleteMany({ department: req.params.did });

    depart.departmentClassMasters.forEach(async (element) => {
      const classMaster = await ClassMaster.findById(element);

      classMaster.classDivision.forEach(async (el) => {
        await Attendence.deleteMany({ className: el });
        await AttendenceDate.deleteMany({ className: el });
        await Class.findByIdAndDelete(el);
        await staffDepart.staffClass.pull(el);
        await institute.classRooms.pull(el);
        await institute.save();

        await staffDepart.save();
      });

      await ClassMaster.findByIdAndDelete(element);
    });

    depart.departmentSubjectMasters.forEach(async (element) => {
      await Subject.deleteMany({ subjectMasterName: element });
      const subj = await SubjectMaster.findById(element);
      subj.subjects.forEach(async (elm) => {
        await staffDepart.staffSubject.pull(elm);
      });

      await SubjectMaster.findByIdAndDelete(element);
    });
    depart.batches.forEach(async (element) => {
      await Batch.findByIdAndDelete(element);
    });
    depart.departmentExam.forEach(async (element) => {
      await Exam.findByIdAndDelete(element);
    });
    depart.checklists.forEach(async (element) => {
      await Checklist.findByIdAndDelete(element);
    });
    depart.fees.forEach(async (element) => {
      await Fees.findByIdAndDelete(element);
    });
    depart.departmentChatGroup.forEach(async (element) => {
      await Staff.findByIdAndDelete(element);
    });
    depart.holiday.forEach(async (element) => {
      await Holiday.findByIdAndDelete(element);
    });

    const institute = await InstituteAdmin.findById(depart.institute);
    institute.depart.pull(req.params.did);
    institute.save();
    await Department.findByIdAndDelete(req.params.did);

    await staffDepart.save();

    res.status(200).send({
      message: "deleted",
    });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(editDepartment)`);
  }
};

exports.delBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.bid);

    await batch.classroom.forEach(async (element) => {
      const classroom = await Class.findById(element);
      classroom.subject.forEach(async (sub) => {
        console.log(sub);
        await Subject.findByIdAndDelete(sub);
      });

      const classmaster = await ClassMaster.findById(classroom.masterClassName);
      const instAdmin = await InstituteAdmin.findById(classroom.institute);
      await classmaster.classDivision.pull(element);

      await instAdmin.classRooms.pull(element);
      instAdmin.save();

      const classTeacher = await Staff.findById(classroom.classTeacher);

      await classTeacher.staffClass.pull(element);
      await classTeacher.save();
      classroom.subject.forEach(async (subj) => {
        const subject = await Subject.findById(subj);
        subject.subjectExams.forEach(async (exam) => {
          await Exam.findByIdAndDelete(exam);
        });
        await SubjectMaster.findByIdAndDelete(subject.subjectMasterName);

        await Subject.findByIdAndDelete(subj);
        await classTeacher.staffSubject.pull(subj);

        await classTeacher.save();
      });
      await Class.findByIdAndDelete(element);

      classmaster.save();
    });

    const depar = await Department.findById(batch.department);
    depar.batches.pull(req.params.bid);
    await depar.save();
    await Batch.findByIdAndDelete(req.params.bid);

    res.status(200).send({
      message: "deleted",
    });
  } catch (err) {
    console.log(err);
    console.log(`SomeThing Went Wrong at this EndPoint(delDepartment)`);
  }
};

exports.updateBatch = async (req, res) => {
  try {
    await Batch.findByIdAndUpdate(req.params.bid, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).send({
      message: "updated",
    });
  } catch (error) {
    console.log(`SomeThing Went Wrong at this EndPoint(UpdateDepartment)`);
  }
};

exports.updateClassMaster = async (req, res) => {
  try {
    await ClassMaster.findByIdAndUpdate(req.params.cid, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).send({
      message: "updated",
    });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(updateClassMaster)`);
  }
};

exports.delClassMaster = async (req, res) => {
  try {
    const classMaster = await ClassMaster.findById(req.params.cid);

    const depart = await Department.findById(classMaster.department);
    const instAdmin = await InstituteAdmin.findById(classMaster.institute);
    await depart.departmentClassMasters.pull(req.params.cid);

    await classMaster.classDivision.forEach(async (element) => {
      const classis = await Class.findById(element);
      await instAdmin.classRooms.pull(element);
      instAdmin.save();

      const classTeacher = await Staff.findById(classis.classTeacher);
      const batch = await Batch.findById(classis.batch);
      await batch.classroom.pull(element);
      await batch.save();
      await classTeacher.staffClass.pull(element);
      await classTeacher.save();
      classis.subject.forEach(async (subj) => {
        const subject = await Subject.findById(subj);
        subject.subjectExams.forEach(async (exam) => {
          await Exam.findByIdAndDelete(exam);
          await batch.batchExam.pull(exam);
          await batch.save();
        });
        await SubjectMaster.findByIdAndDelete(subject.subjectMasterName);
        await depart.departmentSubjectMasters.pull(subject.subjectMasterName);

        await Subject.findByIdAndDelete(subj);
        await classTeacher.staffSubject.pull(subj);

        await classTeacher.save();
      });
      await Class.findByIdAndDelete(element);
    });
    depart.save();

    await ClassMaster.findByIdAndDelete(req.params.cid);

    res.status(200).send({
      message: "deleted",
    });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(DeleteClassMaster)`);
  }
};

exports.updateClass = async (req, res) => {
  try {
    const classis = await Class.findById(req.params.cid);
    const oldClassmaster = await ClassMaster.findById(classis.masterClassName);
    const oldClassStaff = await Staff.findById(classis.classTeacher);
    const newClassmaster = await ClassMaster.findById(req.body.classMaster);
    const newClassStaff = await Staff.findById(req.body.classTeacher);

    const data = {
      classCode: req.body.classCode,
      classHeadTitle: req.body.classHeadTitle,
      classTitle: req.body.classTitle,
      classTeacher: req.body.classTeacher,
      masterClassName: req.body.classMaster,
      className: newClassmaster.className,
    };
    await oldClassStaff.staffClass.pull(req.params.cid);
    await oldClassmaster.classDivision.pull(req.params.cid);
    await newClassStaff.staffClass.push(req.params.cid);
    await newClassmaster.classDivision.push(req.params.cid);

    await oldClassStaff.save();
    await oldClassmaster.save();
    await newClassStaff.save();
    await newClassmaster.save();

    await Class.findByIdAndUpdate(req.params.cid, data);

    res.status(200).send({
      message: "updated",
    });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(updateClass)`);
  }
};

exports.delClass = async (req, res) => {
  try {
    const classes = await Class.findById(req.params.cid);
    const classmaster = await ClassMaster.findById(classes.masterClassName);
    const instAdmin = await InstituteAdmin.findById(classes.institute);
    await classmaster.classDivision.pull(req.params.cid);

    const classis = await Class.findById(req.params.cid);
    await instAdmin.classRooms.pull(req.params.cid);
    instAdmin.save();

    const classTeacher = await Staff.findById(classis.classTeacher);
    const batch = await Batch.findById(classis.batch);
    await batch.classroom.pull(req.params.cid);
    await batch.save();
    await classTeacher.staffClass.pull(req.params.cid);
    await classTeacher.save();
    classis.subject.forEach(async (subj) => {
      const subject = await Subject.findById(subj);
      subject.subjectExams.forEach(async (exam) => {
        await Exam.findByIdAndDelete(exam);
        await batch.batchExam.pull(exam);
        await batch.save();
      });
      await SubjectMaster.findByIdAndDelete(subject.subjectMasterName);
      await depart.departmentSubjectMasters.pull(subject.subjectMasterName);

      await Subject.findByIdAndDelete(subj);
      await classTeacher.staffSubject.pull(subj);

      await classTeacher.save();
    });
    await Class.findByIdAndDelete(req.params.cid);

    classmaster.save();

    res.status(200).send({
      message: "deleted",
    });
  } catch (error) {
    console.log(`SomeThing Went Wrong at this EndPoint(delClass)`);
  }
};

exports.updateSubjectMaster = async (req, res) => {
  try {
    await SubjectMaster.findByIdAndUpdate(req.params.sid, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).send({
      message: "updated",
    });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(updateSubjectMaster)`);
  }
};

exports.delSubjectMaster = async (req, res) => {
  try {
    const subjectMaster = await SubjectMaster.findById(req.params.sid);
    const batch = await Batch.findById(subjectMaster.batch);
    const department = await Department.findById(subjectMaster.department);
    await department.departmentSubjectMasters.pull(req.params.sid);
    await batch.subjectMasters.pull(req.params.sid);
    await batch.save();
    await department.save();

    subjectMaster.subjects.forEach(async (element) => {
      const subject = await Subject.findById(element);
      const classis = await Class.findById(subject.class);
      classis.subject.pull(element);
      await classis.save();
      const teacher = await Staff.findById(subject.subjectTeacherName);
      teacher.staffSubject.pull(element);
      subject.subjectExams.forEach(async (exam) => {
        await Exam.findByIdAndDelete(exam);
        await batch.batchExam.pull(exam);
        await batch.save();
      });

      await teacher.save();
      await Subject.findByIdAndDelete(element);
    });

    await SubjectMaster.findByIdAndDelete(req.params.sid);

    res.status(200).send({
      message: "deleted",
    });
  } catch (err) {
    console.log(`SomeThing Went Wrong at this EndPoint(DeleteSubjectMaster)`);
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.sid);
    const oldSubjectMaster = await SubjectMaster.findById(
      subject.subjectMasterName
    );
    const oldSubjectStaff = await Staff.findById(subject.subjectTeacherName);
    const newSubjectMaster = await SubjectMaster.findById(req.body.subjMaster);
    const newSubjectStaff = await Staff.findById(req.body.subjHead);

    const data = {
      subjectName: req.body.subjectTitle,
      subjectTeacherName: req.body.subjHead,
      subjectMasterName: req.body.subjMaster,
      subjectTitle: newSubjectMaster.subjectName,
    };
    await oldSubjectStaff.staffSubject.pull(req.params.sid);
    await oldSubjectMaster.subjects.pull(req.params.sid);
    await newSubjectStaff.staffSubject.push(req.params.sid);
    await newSubjectMaster.subjects.push(req.params.sid);

    await oldSubjectStaff.save();
    await oldSubjectMaster.save();
    await newSubjectStaff.save();
    await newSubjectMaster.save();

    await Subject.findByIdAndUpdate(req.params.sid, data);

    res.status(200).send({
      message: "updated",
    });
  } catch (err) {
    console.log(`SomeThing Went Wrong at this EndPoint(updateSubject)`);
  }
};

exports.delSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.sid);
    const subjectMasterName = await SubjectMaster.findById(
      subject.subjectMasterName
    );
    await subjectMasterName.subjects.pull(req.params.sid);
    await subjectMasterName.save();
    const classis = await Class.findById(subject.class);
    classis.subject.pull(req.params.sid);
    await classis.save();
    const teacher = await Staff.findById(subject.subjectTeacherName);
    teacher.staffSubject.pull(req.params.sid);
    subject.subjectExams.forEach(async (exam) => {
      await Exam.findByIdAndDelete(exam);
    });

    await teacher.save();

    await Subject.findByIdAndDelete(req.params.sid);

    res.status(200).send({
      message: "Deleted",
    });
  } catch (error) {
    console.log(`SomeThing Went Wrong at this EndPoint(deleteSubject)`);
  }
};

exports.updateSubjectTitle = async (req, res) => {
  try {
    console.log(req.body);

    await Subject.findByIdAndUpdate(req.params.sid, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).send({
      message: "updated",
    });
  } catch (error) {
    console.log(`SomeThing Went Wrong at this EndPoint(updateSubjectTitle)`);
  }
};

exports.delSubjectTitle = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.sid);
    const masterName = await SubjectMaster.findById(
      classDivision.subjectMasterName
    );
    masterName.subjects.pull(req.params.sid);

    masterName.save();

    await Subject.findByIdAndDelete(req.params.sid);

    res.status(200).send({
      message: "deleted",
    });
  } catch (error) {
    console.log(`SomeThing Went Wrong at this EndPoint(deleteSubjectMaster)`);
  }
};

exports.updateChecklist = async (req, res) => {
  try {
    await Checklist.findByIdAndUpdate(req.params.cid, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).send({
      message: "updated",
    });
  } catch (error) {
    res.status(200).send({
      message: "Not found",
    });
  }
};

exports.delChecklist = async (req, res) => {
  try {
    await Checklist.findByIdAndDelete(req.params.cid);

    res.status(200).send({
      message: "deleted",
    });
  } catch (error) {
    console.log(`SomeThing Went Wrong at this EndPoint(delChecklist)`);
  }
};

exports.updateFees = async (req, res) => {
  try {
    await Fees.findByIdAndUpdate(req.params.fid, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).send({
      message: "updated",
    });
  } catch (error) {
    console.log(`SomeThing Went Wrong at this EndPoint(updateFee)`);
  }
};

exports.updateHoliday = async (req, res) => {
  try {
    await Holiday.findByIdAndUpdate(req.params.hid, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).send({
      message: "updated",
    });
  } catch (error) {
    console.log(`SomeThing Went Wrong at this EndPoint(updateHoliday)`);
  }
};

exports.delHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findById(req.params.hid);
    const depart = await Department.findById(holiday.department);
    depart.holiday.pull(req.params.hid);
    await Holiday.findByIdAndDelete(req.params.hid);
    depart.save();

    res.status(200).send({
      message: "deleted",
    });
  } catch (error) {
    console.log(`SomeThing Went Wrong at this EndPoint(delholiday)`);
  }
};

exports.updateStudentProfile = async (req, res) => {
  try {
    await StudentProfile.findByIdAndUpdate(req.params.sid, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).send({
      message: "updated",
    });
  } catch (error) {
    console.log(`SomeThing Went Wrong at this EndPoint(updateStudentProfile)`);
  }
};

exports.updateStaffProfile = async (req, res) => {
  try {
    await StaffProfile.findByIdAndUpdate(req.params.sid, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).send({
      message: "updated",
    });
  } catch (error) {
    console.log(`SomeThing Went Wrong at this EndPoint(updateStaffProfile)`);
  }
};

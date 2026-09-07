import { useState } from "react";
import Swal from "sweetalert2";
import {
  FilePlus2,
  Save,
  FlaskConical,
} from "lucide-react";

import {
  usePatients,
} from "../store/PatientContext";

import {
  useReports,
  type Report,
} from "../store/ReportContext";

import {
  useTests,
} from "../store/TestContext";


export default function NewReport() {

  const { patients } = usePatients();

  const { addReport } = useReports();

  const { tests } = useTests();


  /* =========================================
     STATE
  ========================================= */

  const [selectedTestId, setSelectedTestId] =
    useState("");

  const [testResults, setTestResults] =
    useState<Record<string, string>>({});

  const [formData, setFormData] =
    useState({
      patientId: "",
      specimenType: "",
      clinicalHistory: "",
      diagnosis: "",
      findings: "",
    });


  /* =========================================
     SELECTED TEST
  ========================================= */

  const selectedTest = tests.find(
    (test) =>
      test.id === selectedTestId
  );


  /* =========================================
     FORM CHANGE
  ========================================= */

  function handleChange(
    event: React.ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >
  ) {

    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }


  /* =========================================
     TEST CHANGE
  ========================================= */

  function handleTestChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {

    const testId = event.target.value;

    setSelectedTestId(testId);

    // Reset previous results when test changes
    setTestResults({});
  }


  /* =========================================
     RESULT CHANGE
  ========================================= */

  function handleResultChange(
    parameterId: string,
    value: string
  ) {

    setTestResults((previous) => ({
      ...previous,
      [parameterId]: value,
    }));
  }


  /* =========================================
     GET REFERENCE RANGE
  ========================================= */

  function getReferenceRange(parameter: any) {

    if (!parameter.referenceRange) {
      return "—";
    }

    if (parameter.referenceRange.text) {
      return parameter.referenceRange.text;
    }

    const values = [
      parameter.referenceRange.min,
      parameter.referenceRange.max,
    ].filter(
      (value) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    );

    if (values.length === 0) {
      return "—";
    }

    return values.join(" – ");
  }


  /* =========================================
     SUBMIT REPORT
  ========================================= */

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();


    /* VALIDATION */

    if (!formData.patientId) {

      Swal.fire("Please select a patient.");

      return;
    }


    if (!selectedTest) {

      Swal.fire(
        "Please select a laboratory test."
      );

      return;
    }


    if (!formData.specimenType) {

      Swal.fire(
        "Please enter the specimen type."
      );

      return;
    }


    /* =========================================
       CREATE TEST RESULT SNAPSHOT

       This keeps historical reports unchanged
       even if an administrator later modifies
       the laboratory test configuration.
    ========================================= */

    const reportTestResults =
      selectedTest.parameters.map(
        (parameter) => ({

          parameterId:
            parameter.id,

          parameterName:
            parameter.name,

          unit:
            parameter.unit ?? "",

          referenceRange:
            parameter.referenceRange,

          value:
            testResults[
              parameter.id
            ] ?? "",

        })
      );


    /* =========================================
       CREATE REPORT
    ========================================= */

    const newReport: Report = {

      id:
        crypto.randomUUID(),

      patientId:
        formData.patientId,

      specimenType:
        formData.specimenType,

      clinicalHistory:
        formData.clinicalHistory,

      findings:
        formData.findings,

      diagnosis:
        formData.diagnosis,


      /* TEST INFORMATION */

      testId:
        selectedTest.id,

      testName:
        selectedTest.name,

      department:
        selectedTest.department,


      /* TEST RESULTS */

      testResults:
        reportTestResults,


      /* REPORT STATUS */

      status:
        "draft",

      version:
        1,

      createdAt:
        new Date().toISOString(),

    };


    /* =========================================
       SAVE REPORT
    ========================================= */

    addReport(newReport);


    /* RESET FORM */

    setFormData({
      patientId: "",
      specimenType: "",
      clinicalHistory: "",
      diagnosis: "",
      findings: "",
    });


    setSelectedTestId("");

    setTestResults({});


    Swal.fire(
      "Laboratory report saved as draft!"
    );
  }


  /* =========================================
     UI
  ========================================= */

  return (

    <div className="new-report-page">


      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <div className="report-page-header">

        <div>

          <h2>
            Create New Report
          </h2>

          <p>
            Create a laboratory report for a patient.
          </p>

        </div>

      </div>


      <form
        className="report-form"
        onSubmit={handleSubmit}
      >


        {/* =====================================
            PATIENT INFORMATION
        ====================================== */}

        <div className="report-section">

          <div className="section-title">

            <FilePlus2 size={20} />

            <div>

              <h3>
                Patient Information
              </h3>

              <p>
                Select the patient for this report
              </p>

            </div>

          </div>


          <div className="form-group">

            <label>
              Select Patient
            </label>

            <select
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
            >

              <option value="">
                Select a patient
              </option>


              {patients.map(
                (patient) => (

                  <option
                    key={patient.id}
                    value={patient.id}
                  >

                    {patient.name}
                    {" — "}
                    {patient.patientId}

                  </option>

                )
              )}

            </select>

          </div>

        </div>



        {/* =====================================
            TEST SELECTION
        ====================================== */}

        <div className="report-section">

          <div className="section-title">

            <FlaskConical size={20} />

            <div>

              <h3>
                Laboratory Test
              </h3>

              <p>
                Select a test configured by the administrator
              </p>

            </div>

          </div>


          <div className="form-group">

            <label>
              Select Test
            </label>

            <select
              value={selectedTestId}
              onChange={handleTestChange}
            >

              <option value="">
                Select a laboratory test
              </option>


              {tests.map(
                (test) => (

                  <option
                    key={test.id}
                    value={test.id}
                  >

                    {test.department}
                    {" — "}
                    {test.name}

                  </option>

                )
              )}

            </select>

          </div>


          {/* =====================================
              SELECTED TEST INFORMATION
          ====================================== */}

          {selectedTest && (

            <div className="selected-test-info">

              {/* BLUE ACCENT */}

              <div className="selected-test-accent" />


              {/* CONTENT */}

              <div className="selected-test-content">


                {/* TEST NAME */}

                <div className="selected-test-main">

                  <span className="selected-test-label">
                    Selected Test
                  </span>

                  <h4>
                    {selectedTest.name}
                  </h4>

                </div>


                {/* TEST META */}

                <div className="selected-test-meta">

                  <span className="department-badge">
                    {selectedTest.department}
                  </span>

                  <span className="parameter-count">

                    {selectedTest.parameters.length}

                    {" "}

                    {selectedTest.parameters.length === 1
                      ? "Parameter"
                      : "Parameters"}

                  </span>

                </div>

              </div>

            </div>

          )}

        </div>



        {/* =====================================
            SPECIMEN DETAILS
        ====================================== */}

        <div className="report-section">

          <div className="section-title">

            <FilePlus2 size={20} />

            <div>

              <h3>
                Specimen Details
              </h3>

              <p>
                Enter specimen and clinical information
              </p>

            </div>

          </div>


          <div className="form-group">

            <label>
              Specimen Type
            </label>

            <input
              type="text"
              name="specimenType"
              placeholder="e.g. Whole Blood EDTA"
              value={formData.specimenType}
              onChange={handleChange}
            />

          </div>


          <div className="form-group">

            <label>
              Clinical History
            </label>

            <textarea
              name="clinicalHistory"
              placeholder="Enter relevant clinical history..."
              value={formData.clinicalHistory}
              onChange={handleChange}
              rows={4}
            />

          </div>

        </div>



        {/* =====================================
            TEST RESULTS
        ====================================== */}

        {selectedTest && (

          <div className="report-section test-results-section">

            <div className="section-title">

              <FlaskConical size={20} />

              <div>

                <h3>
                  Test Results
                </h3>

                <p>
                  Enter results for {selectedTest.name}
                </p>

              </div>

            </div>


            {/* PROFESSIONAL RESULTS TABLE */}

            <div className="results-table-wrapper">

              <table className="results-table">

                <thead>

                  <tr>

                    <th>
                      Parameter
                    </th>

                    <th>
                      Result
                    </th>

                    <th>
                      Unit
                    </th>

                    <th>
                      Reference Range
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {selectedTest.parameters.map(
                    (parameter) => (

                      <tr key={parameter.id}>


                        {/* PARAMETER */}

                        <td className="parameter-cell">

                          {parameter.name}

                        </td>


                        {/* RESULT INPUT */}

                        <td className="result-cell">

                          <input
                            type="text"
                            placeholder="Enter result"
                            value={
                              testResults[
                                parameter.id
                              ] ?? ""
                            }
                            onChange={(event) =>
                              handleResultChange(
                                parameter.id,
                                event.target.value
                              )
                            }
                          />

                        </td>


                        {/* UNIT */}

                        <td className="unit-cell">

                          {parameter.unit ?? "—"}

                        </td>


                        {/* REFERENCE RANGE */}

                        <td className="reference-cell">

                          {getReferenceRange(parameter)}

                        </td>


                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}



        {/* =====================================
            REPORT NOTES
        ====================================== */}

        <div className="report-section">

          <div className="section-title">

            <FilePlus2 size={20} />

            <div>

              <h3>
                Report Notes
              </h3>

              <p>
                Additional findings and diagnosis
              </p>

            </div>

          </div>


          <div className="form-group">

            <label>
              Findings
            </label>

            <textarea
              name="findings"
              placeholder="Enter findings..."
              value={formData.findings}
              onChange={handleChange}
              rows={6}
            />

          </div>


          <div className="form-group">

            <label>
              Diagnosis
            </label>

            <textarea
              name="diagnosis"
              placeholder="Enter final diagnosis..."
              value={formData.diagnosis}
              onChange={handleChange}
              rows={4}
            />

          </div>

        </div>



        {/* =====================================
            ACTIONS
        ====================================== */}

        <div className="report-actions">

          <button
            type="submit"
            className="primary-button"
          >

            <Save size={18} />

            Save Draft

          </button>

        </div>


      </form>

    </div>

  );

}
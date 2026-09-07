import { useTests } from "../store/TestContext";
import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  FlaskConical,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import type {
  LaboratoryTest,
  TestParameter,
} from "../domain/types";


type EditingParameter = {
  testId: string;
  parameterId: string;
} | null;

export default function TestManagement() {
  const {
    tests,
    addTest,
    updateTest,
    deleteTest,
    addParameter,
    updateParameter,
    deleteParameter,
    getDepartments,
  } = useTests();

  const departments = getDepartments();

  const [selectedDepartment, setSelectedDepartment] =
    useState("");

  const [expandedTests, setExpandedTests] =
    useState<string[]>([]);

  const [showAddTest, setShowAddTest] =
    useState(false);

  const [editingTestId, setEditingTestId] =
    useState<string | null>(null);

  const [editingParameter, setEditingParameter] =
    useState<EditingParameter>(null);

  const [showAddParameter, setShowAddParameter] =
    useState<string | null>(null);

  const [newTest, setNewTest] = useState({
    name: "",
    department: "",
    specimen: "",
  });

  const [editTest, setEditTest] = useState({
    name: "",
    department: "",
    specimen: "",
  });

  const [newParameter, setNewParameter] = useState({
    name: "",
    type: "number" as "number" | "text",
    unit: "",
    min: "",
    max: "",
    referenceText: "",
  });

  const [editParameterData, setEditParameterData] =
    useState({
      name: "",
      type: "number" as "number" | "text",
      unit: "",
      min: "",
      max: "",
      referenceText: "",
    });

  const visibleTests = useMemo(() => {
    if (!selectedDepartment) {
      return tests;
    }

    return tests.filter(
      (test) =>
        test.department === selectedDepartment
    );
  }, [tests, selectedDepartment]);

  function toggleTest(testId: string) {
    setExpandedTests((previous) =>
      previous.includes(testId)
        ? previous.filter((id) => id !== testId)
        : [...previous, testId]
    );
  }

  // ========================================
  // TEST MANAGEMENT
  // ========================================

  function handleAddTest() {
    if (
      !newTest.name.trim() ||
      !newTest.department.trim()
    ) {
      Swal.fire("Please enter a test name and department.");
        "Please enter a test name and department."
      
      return;
    }

    const test: LaboratoryTest = {
      id: crypto.randomUUID(),

      name: newTest.name.trim(),

      department:
        newTest.department.trim(),

      specimen:
        newTest.specimen.trim() || undefined,

      parameters: [],

      createdAt:
        new Date().toISOString(),
    };

    addTest(test);

    setNewTest({
      name: "",
      department: "",
      specimen: "",
    });

    setShowAddTest(false);

    Swal.fire("Laboratory test added successfully.");
  }

  function startEditTest(test: LaboratoryTest) {
    setEditingTestId(test.id);

    setEditTest({
      name: test.name,
      department: test.department,
      specimen: test.specimen ?? "",
    });
  }

  function saveTest(testId: string) {
    if (
      !editTest.name.trim() ||
      !editTest.department.trim()
    ) {
      Swal.fire(
        "Test name and department are required."
      );
      return;
    }

    updateTest(testId, {
      name: editTest.name.trim(),

      department:
        editTest.department.trim(),

      specimen:
        editTest.specimen.trim() || undefined,

      updatedAt:
        new Date().toISOString(),
    });

    setEditingTestId(null);
  }

  function handleDeleteTest(
    test: LaboratoryTest
  ) {
    const confirmed = window.confirm(
      `Delete "${test.name}" and all its parameters?`
    );

    if (!confirmed) {
      return;
    }

    deleteTest(test.id);

    setExpandedTests((previous) =>
      previous.filter((id) => id !== test.id)
    );
  }

  // ========================================
  // PARAMETER MANAGEMENT
  // ========================================

  function resetNewParameter() {
    setNewParameter({
      name: "",
      type: "number",
      unit: "",
      min: "",
      max: "",
      referenceText: "",
    });
  }

  function handleAddParameter(testId: string) {
    if (!newParameter.name.trim()) {
      Swal.fire("Please enter a parameter name.");
        "Please enter a parameter name."
      
      return;
    }

    const referenceRange =
      newParameter.referenceText.trim()
        ? {
            text:
              newParameter.referenceText.trim(),
          }
        : newParameter.min !== "" ||
            newParameter.max !== ""
          ? {
              min:
                newParameter.min !== ""
                  ? Number(newParameter.min)
                  : undefined,

              max:
                newParameter.max !== ""
                  ? Number(newParameter.max)
                  : undefined,
            }
          : undefined;

    const parameter: TestParameter = {
      id: crypto.randomUUID(),

      name:
        newParameter.name.trim(),

      type:
        newParameter.type,

      unit:
        newParameter.unit.trim(),

      referenceRange,
    };

    addParameter(testId, parameter);

    resetNewParameter();

    setShowAddParameter(null);

    if (!expandedTests.includes(testId)) {
      setExpandedTests((previous) => [
        ...previous,
        testId,
      ]);
    }
  }

  function startEditParameter(
    testId: string,
    parameter: TestParameter
  ) {
    setEditingParameter({
      testId,
      parameterId: parameter.id,
    });

    setEditParameterData({
  name: parameter.name,

  type:
    parameter.resultType === "number" || parameter.resultType === "text"
      ? parameter.resultType
      : parameter.type === "number"
        ? "number"
        : "text",

  unit: parameter.unit ?? "",

      min:
        parameter.referenceRange?.min !==
        undefined
          ? String(
              parameter.referenceRange.min
            )
          : "",

      max:
        parameter.referenceRange?.max !==
        undefined
          ? String(
              parameter.referenceRange.max
            )
          : "",

      referenceText:
        parameter.referenceRange?.text ?? "",
    });
  }

  function saveParameter(
    testId: string,
    parameterId: string
  ) {
    if (
      !editParameterData.name.trim()
    ) {
      Swal.fire("Parameter name is required.");
        "Parameter name is required."
      
      return;
    }

    const referenceRange =
      editParameterData.referenceText.trim()
        ? {
            text:
              editParameterData.referenceText.trim(),
          }
        : editParameterData.min !== "" ||
            editParameterData.max !== ""
          ? {
              min:
                editParameterData.min !== ""
                  ? Number(
                      editParameterData.min
                    )
                  : undefined,

              max:
                editParameterData.max !== ""
                  ? Number(
                      editParameterData.max
                    )
                  : undefined,
            }
          : undefined;

    updateParameter(
      testId,
      parameterId,
      {
        name:
          editParameterData.name.trim(),

        type:
          editParameterData.type,

        unit:
          editParameterData.unit.trim(),

        referenceRange,
      }
    );

    setEditingParameter(null);
  }

  function handleDeleteParameter(
    testId: string,
    parameter: TestParameter
  ) {
    const confirmed = window.confirm(
      `Delete parameter "${parameter.name}"?`
    );

    if (!confirmed) {
      return;
    }

    deleteParameter(
      testId,
      parameter.id
    );
  }

  function getReferenceRange(
    parameter: TestParameter
  ) {
    if (!parameter.referenceRange) {
      return "-";
    }

    if (parameter.referenceRange.text) {
      return parameter.referenceRange.text;
    }

    const values = [
      parameter.referenceRange.min,
      parameter.referenceRange.max,
    ].filter(
      (value) => value !== undefined
    );

    return values.length > 0
      ? values.join(" - ")
      : "-";
  }

  return (
    <div className="test-management-page">

      <div className="test-management-header">
        <div>
          <h2>
            Laboratory Test Management
          </h2>

          <p>
            Create and manage laboratory tests,
            parameters, units and reference ranges.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            setShowAddTest(true)
          }
        >
          <Plus size={18} />
          Add Test
        </button>
      </div>

      {/* ADD TEST */}

      {showAddTest && (
        <div className="admin-form-card">

          <div className="admin-form-header">
            <h3>
              Add New Laboratory Test
            </h3>

            <button
              className="icon-button"
              onClick={() =>
                setShowAddTest(false)
              }
            >
              <X size={18} />
            </button>
          </div>

          <div className="admin-form-grid">

            <div className="form-group">
              <label>Test Name</label>

              <input
                type="text"
                placeholder="e.g. Liver Function Test"
                value={newTest.name}
                onChange={(event) =>
                  setNewTest({
                    ...newTest,
                    name: event.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Department</label>

              <input
                type="text"
                list="department-options"
                placeholder="e.g. Biochemistry"
                value={newTest.department}
                onChange={(event) =>
                  setNewTest({
                    ...newTest,
                    department:
                      event.target.value,
                  })
                }
              />

              <datalist id="department-options">
                {departments.map(
                  (department) => (
                    <option
                      key={department}
                      value={department}
                    />
                  )
                )}
              </datalist>
            </div>

            <div className="form-group">
              <label>Specimen</label>

              <input
                type="text"
                placeholder="e.g. Serum"
                value={newTest.specimen}
                onChange={(event) =>
                  setNewTest({
                    ...newTest,
                    specimen:
                      event.target.value,
                  })
                }
              />
            </div>

          </div>

          <div className="report-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setShowAddTest(false)
              }
            >
              Cancel
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={handleAddTest}
            >
              <Save size={18} />
              Save Test
            </button>

          </div>
        </div>
      )}

      {/* FILTER */}

      <div className="test-filter-bar">

        <label>
          Department:
        </label>

        <select
          value={selectedDepartment}
          onChange={(event) =>
            setSelectedDepartment(
              event.target.value
            )
          }
        >
          <option value="">
            All Departments
          </option>

          {departments.map(
            (department) => (
              <option
                key={department}
                value={department}
              >
                {department}
              </option>
            )
          )}
        </select>

        <span className="test-count">
          {visibleTests.length} Test
          {visibleTests.length !== 1
            ? "s"
            : ""}
        </span>

      </div>

      {/* TEST LIST */}

      <div className="test-management-list">

        {visibleTests.length === 0 && (
          <div className="placeholder-card">

            <FlaskConical size={36} />

            <h3>
              No laboratory tests found
            </h3>

            <p>
              Create your first laboratory test
              to begin.
            </p>

          </div>
        )}

        {visibleTests.map((test) => {

          const isExpanded =
            expandedTests.includes(test.id);

          const isEditing =
            editingTestId === test.id;

          return (
            <div
              className="test-management-card"
              key={test.id}
            >

              {/* TEST HEADER */}

              <div className="test-card-header">

                <button
                  className="expand-button"
                  onClick={() =>
                    toggleTest(test.id)
                  }
                >
                  {isExpanded ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </button>

                {isEditing ? (
                  <div className="test-edit-fields">

                    <input
                      value={editTest.name}
                      onChange={(event) =>
                        setEditTest({
                          ...editTest,
                          name:
                            event.target.value,
                        })
                      }
                    />

                    <input
                      value={
                        editTest.department
                      }
                      onChange={(event) =>
                        setEditTest({
                          ...editTest,
                          department:
                            event.target.value,
                        })
                      }
                    />

                    <input
                      placeholder="Specimen"
                      value={
                        editTest.specimen
                      }
                      onChange={(event) =>
                        setEditTest({
                          ...editTest,
                          specimen:
                            event.target.value,
                        })
                      }
                    />

                  </div>
                ) : (
                  <div className="test-card-info">

                    <h3>
                      {test.name}
                    </h3>

                    <div className="test-meta">

                      <span>
                        {test.department}
                      </span>

                      <span>
                        Specimen:{" "}
                        {test.specimen || "-"}
                      </span>

                      <span>
                        {test.parameters.length} Parameters
                      </span>

                    </div>
                  </div>
                )}

                <div className="test-card-actions">

                  {isEditing ? (
                    <>
                      <button
                        className="icon-button"
                        onClick={() =>
                          saveTest(test.id)
                        }
                      >
                        <Save size={18} />
                      </button>

                      <button
                        className="icon-button"
                        onClick={() =>
                          setEditingTestId(null)
                        }
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="icon-button"
                        onClick={() =>
                          startEditTest(test)
                        }
                      >
                        <Edit3 size={18} />
                      </button>

                      <button
                        className="icon-button danger-button"
                        onClick={() =>
                          handleDeleteTest(test)
                        }
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}

                </div>
              </div>

              {/* PARAMETERS */}

              {isExpanded && (
                <div className="parameter-section">

                  <div className="parameter-section-header">

                    <div>
                      <h4>
                        Test Parameters
                      </h4>

                      <p>
                        Configure result fields,
                        units and reference ranges.
                      </p>
                    </div>

                    <button
                      className="secondary-button"
                      onClick={() => {
                        resetNewParameter();
                        setShowAddParameter(
                          test.id
                        );
                      }}
                    >
                      <Plus size={16} />
                      Add Parameter
                    </button>

                  </div>

                  {/* ADD PARAMETER */}

                  {showAddParameter === test.id && (
                    <div className="parameter-form">

                      <h4>
                        New Parameter
                      </h4>

                      <div className="parameter-form-grid">

                        <div className="form-group">
                          <label>
                            Parameter Name
                          </label>

                          <input
                            placeholder="e.g. ALT"
                            value={
                              newParameter.name
                            }
                            onChange={(event) =>
                              setNewParameter({
                                ...newParameter,
                                name:
                                  event.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>
                            Result Type
                          </label>

                          <select
                            value={
                              newParameter.type
                            }
                            onChange={(event) =>
                              setNewParameter({
                                ...newParameter,
                                type:
                                  event.target
                                    .value as
                                    | "number"
                                    | "text",
                              })
                            }
                          >
                            <option value="number">
                              Number
                            </option>

                            <option value="text">
                              Text
                            </option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>
                            Unit
                          </label>

                          <input
                            placeholder="e.g. U/L"
                            value={
                              newParameter.unit
                            }
                            onChange={(event) =>
                              setNewParameter({
                                ...newParameter,
                                unit:
                                  event.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>
                            Minimum Reference
                          </label>

                          <input
                            type="number"
                            value={
                              newParameter.min
                            }
                            onChange={(event) =>
                              setNewParameter({
                                ...newParameter,
                                min:
                                  event.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>
                            Maximum Reference
                          </label>

                          <input
                            type="number"
                            value={
                              newParameter.max
                            }
                            onChange={(event) =>
                              setNewParameter({
                                ...newParameter,
                                max:
                                  event.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>
                            Text Reference
                          </label>

                          <input
                            placeholder="e.g. Negative"
                            value={
                              newParameter.referenceText
                            }
                            onChange={(event) =>
                              setNewParameter({
                                ...newParameter,
                                referenceText:
                                  event.target.value,
                              })
                            }
                          />
                        </div>

                      </div>

                      <div className="report-actions">

                        <button
                          className="secondary-button"
                          onClick={() =>
                            setShowAddParameter(null)
                          }
                        >
                          Cancel
                        </button>

                        <button
                          className="primary-button"
                          onClick={() =>
                            handleAddParameter(
                              test.id
                            )
                          }
                        >
                          <Save size={16} />
                          Add Parameter
                        </button>

                      </div>

                    </div>
                  )}

                  {/* PARAMETERS TABLE */}

                  {test.parameters.length === 0 ? (
                    <div className="empty-parameters">
                      No parameters configured yet.
                    </div>
                  ) : (
                    <div className="parameters-table">

                      <div className="parameters-header">
                        <span>Parameter</span>
                        <span>Type</span>
                        <span>Unit</span>
                        <span>Reference Range</span>
                        <span>Actions</span>
                      </div>

                      {test.parameters.map(
                        (parameter) => {

                          const isEditingParameter =
                            editingParameter?.testId ===
                              test.id &&
                            editingParameter?.parameterId ===
                              parameter.id;

                          return (
                            <div
                              className="parameters-row"
                              key={parameter.id}
                            >

                              {isEditingParameter ? (
                                <>
                                  <input
                                    value={
                                      editParameterData.name
                                    }
                                    onChange={(event) =>
                                      setEditParameterData({
                                        ...editParameterData,
                                        name:
                                          event.target
                                            .value,
                                      })
                                    }
                                  />

                                  <select
                                    value={
                                      editParameterData.type
                                    }
                                    onChange={(event) =>
                                      setEditParameterData({
                                        ...editParameterData,
                                        type:
                                          event.target
                                            .value as
                                            | "number"
                                            | "text",
                                      })
                                    }
                                  >
                                    <option value="number">
                                      Number
                                    </option>

                                    <option value="text">
                                      Text
                                    </option>
                                  </select>

                                  <input
                                    value={
                                      editParameterData.unit
                                    }
                                    onChange={(event) =>
                                      setEditParameterData({
                                        ...editParameterData,
                                        unit:
                                          event.target
                                            .value,
                                      })
                                    }
                                  />

                                  <div className="reference-edit">

                                    <input
                                      type="number"
                                      placeholder="Min"
                                      value={
                                        editParameterData.min
                                      }
                                      onChange={(event) =>
                                        setEditParameterData({
                                          ...editParameterData,
                                          min:
                                            event.target
                                              .value,
                                        })
                                      }
                                    />

                                    <input
                                      type="number"
                                      placeholder="Max"
                                      value={
                                        editParameterData.max
                                      }
                                      onChange={(event) =>
                                        setEditParameterData({
                                          ...editParameterData,
                                          max:
                                            event.target
                                              .value,
                                        })
                                      }
                                    />

                                    <input
                                      placeholder="Text"
                                      value={
                                        editParameterData.referenceText
                                      }
                                      onChange={(event) =>
                                        setEditParameterData({
                                          ...editParameterData,
                                          referenceText:
                                            event.target
                                              .value,
                                        })
                                      }
                                    />

                                  </div>

                                  <div className="parameter-actions">

                                    <button
                                      className="icon-button"
                                      onClick={() =>
                                        saveParameter(
                                          test.id,
                                          parameter.id
                                        )
                                      }
                                    >
                                      <Save size={17} />
                                    </button>

                                    <button
                                      className="icon-button"
                                      onClick={() =>
                                        setEditingParameter(
                                          null
                                        )
                                      }
                                    >
                                      <X size={17} />
                                    </button>

                                  </div>
                                </>
                              ) : (
                                <>
                                  <span>
                                    {parameter.name}
                                  </span>

                                  <span>
                                    {parameter.type}
                                  </span>

                                  <span>
                                    {parameter.unit || "-"}
                                  </span>

                                  <span>
                                    {getReferenceRange(
                                      parameter
                                    )}
                                  </span>

                                  <div className="parameter-actions">

                                    <button
                                      className="icon-button"
                                      onClick={() =>
                                        startEditParameter(
                                          test.id,
                                          parameter
                                        )
                                      }
                                    >
                                      <Edit3 size={17} />
                                    </button>

                                    <button
                                      className="icon-button danger-button"
                                      onClick={() =>
                                        handleDeleteParameter(
                                          test.id,
                                          parameter
                                        )
                                      }
                                    >
                                      <Trash2 size={17} />
                                    </button>

                                  </div>
                                </>
                              )}

                            </div>
                          );
                        }
                      )}

                    </div>
                  )}

                </div>
              )}

            </div>
          );
        })}

      </div>
    </div>
  );
}